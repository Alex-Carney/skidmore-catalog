import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { UserService } from "../../../services/user.service";
import { Readable } from "stream";
import * as readline from "readline";
import { RepositoryService } from "../../repository/services/repository.service";
import * as md5 from "md5";
import { DataModelBusinessErrors } from "../errors/data-model.error";
import { DataModelPublishInputDTO } from "../dto/data-model-publish.dto";
import { RepositoryPermissions } from "../../repository/constants/permission-level-constants";
import { DeleteDataModelDTO } from "../dto/delete-data-model.dto";
import { UpdateDataModelFieldsDTO } from "../dto/data-model-update.dto";
import { UpdateDataModelRepositoriesDTO } from "../dto/update-resource-repository.dto";
import { UpdateDataModelFieldNamesDTO } from "../dto/update-data-model-names.dto";
import { ResourceService } from "./resource.service";
import { NonExistenceFlags } from "../../../constants/nonexistant-constants";
import { RepositoryValidation } from "../../repository/validation/repository.validation";


@Injectable()
export class DataModelService {
  /**
   * @service An injectable service handling all operations relating to data models. Depends on PrismaService,
   * UserService, and RepositoryService.
   *
   * @param prisma
   * @param userService
   * @param repositoryService
   * @param resourceService
   * @param repositoryValidation
   */
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private repositoryService: RepositoryService,
    private resourceService: ResourceService,
    private repositoryValidation: RepositoryValidation
  ) {
  }

  //----------------------------------------------------------------------------------------
  // CRUD OPERATIONS
  //----------------------------------------------------------------------------------------


  /**
   * @method Parses an input file, attempting to return a data model object so that the repository doesn't have to make it
   * themselves for subsequent calls.
   *
   * Users the header from the file to extract field (column) names
   * Reads rows until each column is mapped to an associated data type. Null values are allowed, so this may not be
   * completed from a single input row
   *
   * @param file binary file from controller
   * @throws BadRequestException An error describing what went wrong while parsing input file
   * @returns DataModel An object representing a data model that can be copy and pasted for future calls
   * @throws BadRequestException if an error occurs while parsing input file
   */
  async generateDataModel(file: Express.Multer.File) {
    console.log(file)
    const buf = file.buffer;

    console.log(buf)

    try {
      const rl = readline.createInterface({
        input: Readable.from(buf),
        crlfDelay: Infinity
      });
      let lNum = 0;
      const fieldNames = new Array<string>();
      //Tracks the relationship between this field and its [datatype, localizedName <- added later]
      const fieldToDataType = new Map<string, Array<string>>();
      for await (const line of rl) {
        //the first line must be the header -- containing the field names
        if (lNum == 0) {

          /**
           * I was having an issue where a BOM (byte order mark) was showing up as the first char in my uploaded files.
           * Therefore, we must explicitly remove that first character, otherwise it gets saved in the DB
           */
          const cleanFirstLine = line.replace(`\ufeff`, "");

          console.log(cleanFirstLine)

          // line.split(",").forEach((field) => {
          //   fieldNames.push(field);
          // });
          await this.generateFieldNamesFromFirstFileLine(cleanFirstLine, fieldNames);
        } else {
          //this could very well be a nested while instead, but i'd rather do it this way
          if (fieldToDataType.size < fieldNames.length) {
            // line.split(",").forEach((element, index) => {
            //   //Three possibilities: Not a number, a number, or "".
            //   //ignore null fields, but keep looping through the file until there are none left
            //   if (element !== "") {
            //     fieldToDataType.set(fieldNames[index], [Number.isNaN(Number(element)) ? "text" : "numeric"]);
            //   }
            //
            // });
            await this.handleFileBody(line, fieldToDataType, fieldNames);
          } else {
            //no need to read the entire file, stop once all data types are extracted
            break;
          }
        }
        lNum++;
      }
      console.log({ fields: fieldToDataType });
      return this.convertMapToObj(fieldToDataType);
    } catch (err) {
      const errorToThrow = DataModelBusinessErrors.ErrorParsingInputFile;
      errorToThrow.additionalInformation = err.message;
      throw new BadRequestException(errorToThrow);
    }

  }

  private async generateFieldNamesFromFirstFileLine(line, fieldNames) {
    line.split(",").forEach((field) => {
      fieldNames.push(field);
    });
  }

  private async handleFileBody(line, fieldToDataType, fieldNames) {
    line.split(",").forEach((element, index) => {
      //Three possibilities: Not a number, a number, or "".
      //ignore null fields, but keep looping through the file until there are none left
      if (element !== "") {
        fieldToDataType.set(fieldNames[index], [Number.isNaN(Number(element)) ? "text" : "numeric"]);
      }
    });
  }


  //--------------------------------------------------------------------

  /**
   * @method Publishes the data model as a "Resource" object in the database. Also generates the "ResourceField" objects that store the localized name
   * and data type.
   * Also creates an empty table in another section of the DB (datastore schema in Postgres) that will eventually be seeded with raw data by the repository
   *
   * @param userId User who is publishing the resource (mainly for logging purposes)
   * @param dataModelPublishInputDto The associated data transfer object. See source file for more details
   * @returns dataModelRecord The record of the newly created resource, including the auto-generated ResourceField objects
   */
  async publishDataModel(userId: string, dataModelPublishInputDto: DataModelPublishInputDTO) {


    //step 0: validate inputs
    // for (const repositoryToValidate of dataModelPublishInputDto.repository) {
      //if any repository input repository is invalid, stop all execution
      //await this.repositoryService.validateRepositoryExistence(repositoryToValidate);
      //await this.repositoryService.authenticateUserRequest(userId, repositoryToValidate, RepositoryPermissions.REPOSITORY_ADMIN);
    // }
    await this.resourceService.validateResourceNameDoesNotAlreadyExist(dataModelPublishInputDto.resourceName)

    //step 1: modify incoming data model to include localized names
    this.addLocalizedNamesToFields(dataModelPublishInputDto.dataModel);


    /**
     * Allows all of the entries in the dataModel to be handled at once in a single prisma query.
     * An example fieldInfo looks like this: [fieldName, [dataType, localizedName]] all as strings
     * createManyInput is used in the transaction to generate the resource record.
     */
    const createManyInput = Object.entries(dataModelPublishInputDto.dataModel).map((fieldInfo) => {
      return {
        fieldName: fieldInfo[0],
        dataType: fieldInfo[1][0],
        localizedName: fieldInfo[1][1]
      };
    });

    /**
     * Similar to above, allows all of the entries in the "repositories" input to be handled at once in a single prisma query.
     * The repositories are added to the explicit ResourcesOnRepositories m-n relation in the transaction below
     */
    // const connectManyInput = dataModelPublishInputDto.repository.map((repository) => {
    //   return {
    //     repositoryTitle: repository
    //   };
    // });


    /**
     * Builds the SQL statement for CREATE TABLE (args), based on the datamodel input that the repository provides.
     * Prisma does not know about the tables in the "datastore" schema, which is why we create these tables with raw SQL
     * instead of using prisma's CREATE API.
     */
    let createTableArguments = "";
    Object.values(dataModelPublishInputDto.dataModel).forEach((dataTypeAndLocName) => {
      createTableArguments += (dataTypeAndLocName[1] + " " + dataTypeAndLocName[0] + ",");
    });
    const tableArguments = `datastore."${dataModelPublishInputDto.resourceName}" ( ${createTableArguments.slice(0, -1)} )`; //remove trailing comma


    /**
     * This transaction creates the datamodel record (that is known by prisma and uses its API) along with the table inside
     * the 'datastore' schema that will store the raw data that the repository seeds later. This second table is unknown to
     * prisma, so it is created with raw SQL.
     * The two statements are wrapped in a transaction because they both need to succeed (or fail) together or else the
     * database will become de-synced.
     */
    try {
      const [dataModelRecord] = await this.prisma.$transaction([
        //statement 1
        this.prisma.resource.create({
          data: {
            title: dataModelPublishInputDto.resourceName,
            createdBy: {
              connect: {
                id: userId
              }
            },
            repositories: {
              create: {
                repositoryTitle: dataModelPublishInputDto.repository
              }
            },
            fields: {
              createMany: {
                data: createManyInput
              }
            }
          },
          include: {
            fields: true //may reduce the amount of information returned later
          }
        }),
        //statement 2
        this.prisma.$executeRaw("CREATE TABLE " + tableArguments)
      ]);
      return dataModelRecord;
    } catch (err) {
      //one of the processes in the transaction failed
      throw new InternalServerErrorException(err.message);
    }


  }

  //--------------------------------------------------------------------

  /**
   * @method Fetches repository-friendly records of datamodels they have uploaded. Intended purpose is just called viewing
   *
   * @param repository
   * @returns datamodels An object description of the resources the repository has uploaded
   */
  async returnDataModels(repository: string) {
    await this.repositoryService.validateRepositoryExistence(repository);
    return this.prisma.resource.findMany({
      where: {
        repositories: {
          some: {
            repositoryTitle: repository
          }
        }
      },
      include: {
        fields: {
          select: {
            fieldName: true,
            dataType: true
          }
        },
        repositories: {
          select: {
            repositoryTitle: true
          }
        }
      }
    });
  }

  //--------------------------------------------------------------------

  /**
   * Returns the exact datamodel associated with a resource. Intended purpose is for the repository to copy, modify, then
   * use in a subsequent call (usually update datamodel)
   *
   * @param resourceName resource to return data model of
   * @param asMap boolean flag whether or not to return the data as a map or an object
   * @param includeLocalizedName
   */
  async returnDataModelExact(resourceName: string, asMap: boolean, includeLocalizedName: boolean) {
    const fieldInfo = await this.prisma.resource.findUnique({
      where: {
        title: resourceName
      },
      include: {
        fields: {
          select: {
            fieldName: true,
            dataType: true,
            localizedName: includeLocalizedName
          }
        }
      }
    });

    const fieldMap = new Map<string, Array<string>>();
    fieldInfo.fields.forEach((field) => {
      if (includeLocalizedName) {
        fieldMap.set(field.fieldName, [field.dataType, field.localizedName]);
      } else {
        fieldMap.set(field.fieldName, [field.dataType]);
      }
    });

    return asMap ? fieldMap : this.convertMapToObj(fieldMap);
  }

  //--------------------------------------------------------------------

  /**
   * @method Updates repositories associated with a data model. User can choose whether incoming repositories should
   * be removed from current list, or added
   *
   * @param userId
   * @param updateDataModelRepositoriesDTO data transfer object associated with this call. More information in the
   * UpdateDataModelRepositoriesDTO file
   * @returns create/delete creation or deletion record of new repositories
   */
  async updateDataModelRepositories(userId: string, updateDataModelRepositoriesDTO: UpdateDataModelRepositoriesDTO) {

    await this.repositoryService.validateRepositoryExistence(updateDataModelRepositoriesDTO.repository);
    await this.repositoryService.authenticateUserRequest(userId, updateDataModelRepositoriesDTO.repository, RepositoryPermissions.REPOSITORY_ADMIN);

    const resourceTitle_repositoryTitle = {
      resourceTitle: updateDataModelRepositoriesDTO.resourceName,
      repositoryTitle: updateDataModelRepositoriesDTO.repository
    };


    if (updateDataModelRepositoriesDTO.removeRepositories) {
      return this.prisma.resourcesOnRepositories.delete({
        where: {
          resourceTitle_repositoryTitle: resourceTitle_repositoryTitle
        }
      });
    } else {
      return this.prisma.resourcesOnRepositories.create({
        data: resourceTitle_repositoryTitle
      });
    }

  }

  //--------------------------------------------------------------------

  /**
   * @method This is the most complicated method in this project. User supplies an updated data model in their request.
   * Parses input schema and compares it to the existing one, deducing changes that need to be made and executing them
   * Additionally, these deduced changes must be mirrored in both the raw datastore itself, along with the record in the
   * resource/resource field tables.
   *
   * Changes to datastore schema include: ALTER datatype of column, CREATE new columns, DROP old columns
   * Changes to associated resource entries include: DELETE resource field, CREATE resource field, ALTER resource field type
   *
   * @param userId
   * @param updateDataModelDTO data transfer object associated with this call. More information in the UpdateDataModelDTO
   * file
   *
   */
  async updateDataModelFields(userId: string, updateDataModelDTO: UpdateDataModelFieldsDTO) {

    //step 0: Only an ADMIN of this repository can update data model fields
    await this.repositoryService.validateRepositoryExistence(updateDataModelDTO.repository);
    await this.resourceService.validateResourceAccessFromRepository(updateDataModelDTO.repository, updateDataModelDTO.resourceName);
    await this.repositoryService.authenticateUserRequest(userId, updateDataModelDTO.repository, RepositoryPermissions.REPOSITORY_ADMIN);


    console.log("Name" + updateDataModelDTO.resourceName);

    //step 1: Grab the current data model to see what is different -- include the localized names
    const currentDataModel: Record<string, Array<string>> = await this.returnDataModelExact(updateDataModelDTO.resourceName, false, true);

    console.log("--------CURRENT DATA MODEL---------");
    console.log(currentDataModel);
    console.log("-----------------");

    //step 2: update the repository input data model to include the associated localized names
    this.addLocalizedNamesToFields(updateDataModelDTO.dataModel);

    /**
     * Step 3: Determine what combination of the possible changes to data model is being requested
     */
    const currKeys = Object.keys(currentDataModel);
    const newKeys = Object.keys(updateDataModelDTO.dataModel);

    console.log(currKeys);
    console.log(newKeys);

    //step 3.1 instantiate holders for everything that can change
    const createNewInput = [];
    const deleteInput = [];
    const changeDatatypeToText = [];
    const changeDatatypeToNumeric = [];


    /**
     * step 3.2: alterInputOne handles modification of data type, along with dropping columns
     *
     * For each field in the current data model, look for the same key in the incoming data model. If there is a match,
     * update data type if a change was made. Otherwise, if the incoming data model does not contain the current field,
     * mark it to be dropped.
     */
    let alterInputOne = currKeys.map((key) => {
      //############################ DEBUGGING STUFF ######################
      console.log(key);
      console.log(newKeys);
      console.log(newKeys.includes(key));

      console.log("one going to transform key" + key + " info " + currentDataModel[key][0]);
      const localizedFieldName = "c" + md5(currentDataModel[key][0]);
      console.log("equal next?" + localizedFieldName);
      console.log("equal above?" + currentDataModel[key][1]);
      //##################################################################

      if (newKeys.includes(key)) {
        //if this key is present in the new data model, check if the data type is the same
        if (currentDataModel[key][0] !== updateDataModelDTO.dataModel[key][0]) {
          //handle text -> numeric and numeric -> text separately
          updateDataModelDTO.dataModel[key][0] == "text"
            ? changeDatatypeToText.push(key)
            : changeDatatypeToNumeric.push(key);
          //build SQL ALTER - modifies data types
          return `ALTER COLUMN "${currentDataModel[key][1]}" 
          TYPE ${updateDataModelDTO.dataModel[key][0]} 
          USING ${currentDataModel[key][1]}
          ::${updateDataModelDTO.dataModel[key][0]}`;
        } else {
          return "$R"; //signal to remove this entry and its comma from the final string
        }
      } else {
        //this is an entry that is in the CURRENT DATA MODEL, but NOT THE NEW ONE. Drop it
        deleteInput.push("'" + key + "'");
        return `DROP COLUMN ${currentDataModel[key][1]}`;
      }
    }).toString();

    /**
     * step 3.3:
     * After alterInputOne, we have accounted for all elements IN current data model that are NOT in the new data model.
     * Now, we must go the other way, in order to determine what columns to ADD
     * alterInputTwo handles adding new columns
     */
    let alterInputTwo = newKeys.map((key) => {
      //############# DEBUGGING
      console.log("going to transform key" + key + " into " + updateDataModelDTO.dataModel[key]);
      //#############

      if (!(currKeys.includes(key))) {
        createNewInput.push({
          fieldName: key,
          dataType: updateDataModelDTO.dataModel[key][0],
          localizedName: updateDataModelDTO.dataModel[key][1]
        });
        return `ADD COLUMN IF NOT EXISTS "${updateDataModelDTO.dataModel[key][1]}" ${updateDataModelDTO.dataModel[key][0]}`;
      } else {
        return "$R";
      }
    }).toString();

    //############# DEBUGGING
    console.log(alterInputOne);
    console.log(alterInputTwo);
    //#############

    //Step 4: Clean SQL execution strings

    //$R is a placeholder for "do nothing"
    alterInputOne = alterInputOne.replace(/\$R,/g, "").replace(/\$R/g, "");
    alterInputTwo = alterInputTwo.replace(/\$R,/g, "").replace(/\$R/g, "");

    //final string cleaning, remove all trailing commas
    if (alterInputOne.charAt(alterInputOne.length - 1) == ",") {
      alterInputOne = alterInputOne.slice(0, -1);
    }
    if (alterInputTwo.charAt(alterInputTwo.length - 1) == ",") {
      alterInputTwo = alterInputTwo.slice(0, -1);
    }

    //############# DEBUGGING
    console.log(alterInputOne);
    console.log(alterInputTwo);

    console.log("create: " + createNewInput);
    console.log("delete: " + deleteInput);
    //#############

    /**
     * Here I ran into another problem with prisma. The "upsert" action allows me to EITHER update OR add new records. However, unlike create,
     * update, and delete, there is NO upsertAll. As of Jan/20/2022 this is still not a feautre of prisma
     * https://github.com/prisma/prisma/issues/5066
     * Therefore, we must use a PUT method and delete everything then re-create it
     */

    /**
     * Final Step: Add every SQL change, including raw executions to data table, along with prisma executions to
     * associated resource fields, to a single transaction.
     */
    const transactionArray = [];
    //DELETE
    if (deleteInput.length >= 1) {
      console.log(`DELETE FROM universe."ResourceField" WHERE "fieldName" in (${deleteInput})`);
      transactionArray.push(this.prisma.$executeRaw(`DELETE FROM universe."ResourceField" WHERE "fieldName" in (${deleteInput})`));
    }
    //CREATE
    if (createNewInput.length >= 1) {
      transactionArray.push(this.prisma.resource.update({
        where: {
          title: updateDataModelDTO.resourceName
        },
        data: {
          fields: {
            createMany: {
              data: createNewInput
            }
          }
        }
      }));
    }
    //UPDATE DATA TYPE 1
    if (changeDatatypeToNumeric.length >= 1) {
      transactionArray.push(this.prisma.resource.update({
        where: {
          title: updateDataModelDTO.resourceName
        },
        data: {
          fields: {
            updateMany: {
              where: {
                fieldName: {
                  in: changeDatatypeToNumeric
                }
              },
              data: {
                dataType: "numeric"
              }
            }
          }
        }
      }));
    }
    //UPDATE DATA TYPE 2
    if (changeDatatypeToText.length >= 1) {
      transactionArray.push(this.prisma.resource.update({
        where: {
          title: updateDataModelDTO.resourceName
        },
        data: {
          fields: {
            updateMany: {
              where: {
                fieldName: {
                  in: changeDatatypeToText
                }
              },
              data: {
                dataType: "text"
              }
            }
          }
        }
      }));
    }

    //MODIFICATION OF DATA TYPE + DROPPING COLUMNS (to raw datastore table)
    if (alterInputOne.length >= 1) {
      console.log(`ALTER TABLE datastore."${updateDataModelDTO.resourceName}" ${alterInputOne}`);
      transactionArray.push(this.prisma.$executeRaw(`ALTER TABLE datastore."${updateDataModelDTO.resourceName}" ${alterInputOne}`));
    }
    //ADDING NEW COLUMNS (to raw datastore table)
    if (alterInputTwo.length >= 1) {
      console.log(`ALTER TABLE datastore."${updateDataModelDTO.resourceName}" ${alterInputTwo}`);
      transactionArray.push(this.prisma.$executeRaw(`ALTER TABLE datastore."${updateDataModelDTO.resourceName}" ${alterInputTwo}`));
    }
    //Execute every change all at once, or none at all
    const [newDataModelRecord] = await this.prisma.$transaction(transactionArray);

    return newDataModelRecord;

  }

  //--------------------------------------------------------------------
  /**
   * @method updateDataModelFields can handle changing schema data types, along with adding/removing fields. However,
   * if a repository attempts to 'rename' a field using that method, all of the stored data will be dropped. This method
   * circumvents that issue, but requires its own API route.
   *
   * @param userId repository attempting operation
   * @param updateDataModelFieldNamesDTO Data transfer object for this operation. More information in its file
   */
  async alterDataModelColumnNames(userId: string, updateDataModelFieldNamesDTO: UpdateDataModelFieldNamesDTO) {
    //step 0: validate inputs
    await this.repositoryService.validateRepositoryExistence(updateDataModelFieldNamesDTO.repository);
    await this.resourceService.validateResourceAccessFromRepository(updateDataModelFieldNamesDTO.repository, updateDataModelFieldNamesDTO.resourceName);
    await this.repositoryService.authenticateUserRequest(userId, updateDataModelFieldNamesDTO.repository, RepositoryPermissions.REPOSITORY_ADMIN);

    //step 1: generate a list of ALTER TABLE statements based on the requested name changes
    const alterTableStatements = [];
    const updateResourceStatements = [];
    //parse repository's request
    for (const fieldNameToChange of Object.keys(updateDataModelFieldNamesDTO.fieldNameRemapping)) {
      const validatedResourceField = await this.resourceService.validateResourceFieldExistence(updateDataModelFieldNamesDTO.resourceName, fieldNameToChange);
      const oldFieldLocalizedName = validatedResourceField.fields[0].localizedName;
      const newLocalizedName = "c" + md5(updateDataModelFieldNamesDTO.fieldNameRemapping[fieldNameToChange]);
      alterTableStatements.push(`ALTER TABLE datastore."${updateDataModelFieldNamesDTO.resourceName}" RENAME "${oldFieldLocalizedName}" TO "${newLocalizedName}";`);
      updateResourceStatements.push(this.prisma.resourceField.updateMany({
        where: {
          fieldName: fieldNameToChange
        },
        data: {
          fieldName: updateDataModelFieldNamesDTO.fieldNameRemapping[fieldNameToChange],
          localizedName: newLocalizedName
        }
      }));
    }
    const transactionArray = [];
    if (alterTableStatements.length > 0) {
      /**
       * Multiple commands cannot be executed from one $executeRaw. Since ALTER RENAME does not support multiple arguments,
       * each rename must be counted as a separate execution.
       */
      alterTableStatements.forEach((alterTableStatement) => {
        console.log(alterTableStatement.toString());
        transactionArray.push(this.prisma.$executeRaw(`${alterTableStatement.toString()}`));
      });
    }
    if (updateResourceStatements.length > 0) {
      transactionArray.push(...updateResourceStatements);
    }

    console.log(transactionArray);

    return this.prisma.$transaction(transactionArray);


  }


  //--------------------------------------------------------------------

  /**
   * @method Deletes a data model, along with its associated table in the datastore schema. Once again, Prisma does not
   * yet support deletion of many-to-many relations, but Postgres can handle the cascading deletes with a delete
   * execution on the parent
   *
   * @param userId
   * @param deleteDataModelDTO Data transfer object for operation. More information in the DeleteDataModelDTO file
   * @returns message An object telling the repository that their requested data model was deleted
   */
  async deleteDataModel(userId: string, deleteDataModelDTO: DeleteDataModelDTO) {
    //step 0: validate inputs
    await this.repositoryService.validateRepositoryExistence(deleteDataModelDTO.repository);
    await this.resourceService.validateResourceAccessFromRepository(deleteDataModelDTO.repository, deleteDataModelDTO.resourceName);
    await this.repositoryService.authenticateUserRequest(userId, deleteDataModelDTO.repository, RepositoryPermissions.REPOSITORY_OWNER);


    //transaction steps: delete the data model record itself
    //delete the table storing the data itself
    try {
      await this.prisma.$transaction([
        this.prisma.$executeRaw(`DELETE FROM universe."Resource" WHERE title = '${deleteDataModelDTO.resourceName}'`),
        this.prisma.$executeRaw(`DROP TABLE datastore."${deleteDataModelDTO.resourceName}"`)
      ]);
      return { message: "Successfully deleted the " + deleteDataModelDTO.resourceName + " data model" };
    } catch (err) {
      throw new InternalServerErrorException(err.message);

    }


    //----------------------------------------------------------------------------------------
    // OTHER FUNCTIONALITY
    //----------------------------------------------------------------------------------------

  }


  //--------------------------------------------------------------------

  /**
   * not my code https://stackoverflow.com/questions/37437805/convert-map-to-json-object-in-javascript
   * with some slight modifications
   * @param inputMap: Map<string, Array<string>> input map to convert
   * @returns obj The input map converted to a JSON object, to be returned to the view
   */
  convertMapToObj(inputMap: Map<string, Array<string>>) {
    const obj = {};
    inputMap.forEach((v, k) => {
      obj[k] = v;
    });
    return obj;
  }

  /**
   * @method 'Localized name' refers to the letter c + hashed version of the input field name. I wanted the repository to only
   * interact with their chosen display names for fields, however Postgres does not allow special characters in column
   * names. Therefore, on the backend display names are stored as the 'localized name'
   *
   * @param dataModel
   */
  addLocalizedNamesToFields(dataModel: Record<string, Array<string>>) {
    Object.keys(dataModel).forEach((fieldName) => {
      console.log(dataModel[fieldName]);
      (dataModel[fieldName]).push("c" + md5(fieldName));
    });

  }


}
