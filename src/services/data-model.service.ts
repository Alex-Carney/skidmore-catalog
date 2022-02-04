import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { UserService } from "./user.service";
import { Readable } from "stream";
import * as readline from "readline";
import { RepositoryService } from "./repository.service";
import * as md5 from 'md5';
import { DataModelBusinessErrors } from "../errors/data-model.error";


@Injectable()
export class DataModelService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private repositoryService: RepositoryService,
  ) {}


  /**
   * @method Parses an input file, attempting to return a data model object so that the user doesn't have to make it
   * themselves for subsequent calls.
   *
   * Users the header from the file to extract field (column) names
   * Reads rows until each column is mapped to an associated data type. Null values are allowed, so this may not be
   * completed from a single input row
   *
   * @param file binary file from controller
   */
  async generateDataModel(file: Express.Multer.File) {
    const buf = file.buffer;
    try {
      const rl = readline.createInterface({
        input: Readable.from(buf),
        crlfDelay: Infinity,
      });

      let lNum = 0;
      const fieldNames = new Array<string>();
      const fieldToDataType = new Map<string, string>(); //This map tracks the relationship between a column's name and its datatype
      for await (const line of rl) {
        //the first line must be the header -- containing the field names
        if(lNum == 0) {
          line.split(',').forEach((field) => {
            fieldNames.push(field);
          });
        } else {
          //this could very well be a nested while instead, but i'd rather do it this way
          if(fieldToDataType.size < fieldNames.length) {
            line.split(',').forEach((element, index) => {
              //Three possibilities: Not a number, a number, or "".
              if(element !== "") {
                fieldToDataType.set(fieldNames[index], Number.isNaN(Number(element)) ? "text" : "numeric");
              }
              //ignore null fields, but keep looping through the file until there are none left
            });
          } else {
            //no need to read the entire file, stop once all data types are extracted
            break;
          }
        }
        lNum++;
      }
      console.log({fields: fieldToDataType});
      return this.convertMapToObj(fieldToDataType);
    } catch(err) {
      const errorToThrow = DataModelBusinessErrors.ErrorParsingInputFile;
      errorToThrow.additionalInformation = err.message;
      throw new BadRequestException(errorToThrow);
    }

  }

  //--------------------------------------------------------------------

  /**
   * not my code https://stackoverflow.com/questions/37437805/convert-map-to-json-object-in-javascript
   * with some slight modifications
   * @param inputMap
   * @returns
   */
  convertMapToObj(inputMap: Map<string, string>) {
    const obj = {};
    inputMap.forEach((v, k) => {
      obj[k] = v;
    });
    return obj;
  }

  //--------------------------------------------------------------------

  /**
   * Publishes the data model as a "Resource" object in the database. Also generates the "ResourceField" objects that store the localized name
   * and data type.
   * Also creates an empty table in another section of the DB that will eventually be seeded with data by the user
   *
   * @param dataModel: Returned from the "generateDataModel" method. Contains a record of column display name to column localized name and datatype
   * @param resourceName Name of resource to be published
   * @param userId User who is publishing the resource (mainly for logging purposes)
   * @param repositories
   * @returns The record of the newly created resource, including the auto-generated ResourceField objects
   */
  async publishDataModel(dataModel: Record<string, Array<string>>, resourceName: string, userId: string, repositories: string[]) {

    /**
     * At first I kept the localized name in the datamodel itself, but ran into the issue where if users wanted to change their
     * datamodels by adding a new column, they would have no idea what to supply for the "localizedname" field. I didn't want to
     * inconveinence my users by having them generate the localized names themselves, so they are added whenever the data model
     * is being published accordingly
     */
    Object.keys(dataModel).forEach((fieldName) => {
      dataModel[fieldName].push("c" + md5(fieldName));
    })

    /**
     * This code allows all of the entries in the dataModel to be handled at once in a single prisma query.
     * An example fieldInfo looks like this: [fieldName, [dataType, localizedName]] all as strings
     * createManyInput is used in the transaction to generate the resource record.
     */
    const createManyInput = Object.entries(dataModel).map((fieldInfo) => {
      return {
        fieldName: fieldInfo[0],
        dataType: fieldInfo[1][0],
        localizedName: fieldInfo[1][1],
      };
    });

    /**
     * This code (similar to above) allows all of the entires in the "repositories" input to be handled at once in a single prisma query.
     * The repositories are added to the explicit ResourcesOnRepositories m-n relation in the transaction below
     */
    const connectManyInput = repositories.map((repository) => {
      return {
        repositoryTitle: repository,
      }
    });


    /**
     * This code builds the SQL statement for CREATE TABLE (args), based on the datamodel input that the user provides.
     * Prisma does not know about the tables in the "datastore" schema, which is why we create these tables with raw SQL
     * instead of using prisma's CREATE API.
     */
    let createTableArguments = "";
    Object.values(dataModel).forEach((dataTypeAndLocName) => {
      createTableArguments += (dataTypeAndLocName[1] + " " + dataTypeAndLocName[0] + ",");
    });
    const tableArguments = `datastore."${resourceName}" ( ${createTableArguments.slice(0,-1)} )` //remove trailing comma


    /**
     * This transaction creates the datamodel record (that is known by prisma and uses its API) along with the data that will store
     * the raw data that the user seeds later. This second table is unknown to prisma, so it is created with raw SQL
     * The two statements are wrapped in a transaction because they both need to succeed (or fail) together or else the database will become
     * out of sync.
     */
    const [dataModelRecord, ] = await this.prisma.$transaction([
      //statement 1
      this.prisma.resource.create({
        data: {
          title: resourceName,
          createdBy: {
            connect: {
              id: userId,
            }
          },
          repositories: {
            createMany: {
              data: connectManyInput,
            }
          },
          fields: {
            createMany: {
              data: createManyInput
            }
          },
        },
        include: {
          fields: true, //may reduce the amount of information returned later
        }
      }),
      //statement 3
      this.prisma.$executeRaw("CREATE TABLE " + tableArguments),
    ]);
    return dataModelRecord;
  }

  //--------------------------------------------------------------------

  returnDataModels(repository: string) {
    return this.prisma.resource.findMany({
      where: {
        repositories: {
          some: {
            repositoryTitle: repository,
          }
        }
      },
      include: {
        fields: {
          select: {
            fieldName: true,
            dataType: true,
          }
        },
        repositories: {
          select: {
            repositoryTitle: true,
          }
        }
      }
    });
  }

  //--------------------------------------------------------------------

  async returnDataModelExact(resourceName: string, asMap: boolean) {
    const fieldInfo = await this.prisma.resource.findUnique({
      where: {
        title: resourceName,
      },
      include: {
        fields: true,
      }
    })

    const fieldMap = new Map<string, string>();
    fieldInfo.fields.forEach((field) => {
      fieldMap.set(field.fieldName, field.dataType)
    })

    return asMap ? fieldMap : this.convertMapToObj(fieldMap);
  }

  //--------------------------------------------------------------------

  async updateDataModelRepositories(resourceName: string, userId: string, repository: string, remove: boolean) {
    const access = await this.repositoryService.authenticateUserRequest(userId, repository, 2);
    if(access == false) {
      return //throw authentication error
    }

    const updateArgs = remove ?
      {disconnect: {resourceTitle_repositoryTitle: {resourceTitle: resourceName, repositoryTitle: repository}}}
      : {connect: {resourceTitle_repositoryTitle: {resourceTitle: resourceName, repositoryTitle: repository}}};


    if(remove) {
      return this.prisma.resourcesOnRepositories.delete({
        where: {
          resourceTitle_repositoryTitle: {
            resourceTitle: resourceName,
            repositoryTitle: repository,
          }
        },
      })
    } else {
      return this.prisma.resourcesOnRepositories.create({
        data: {
          resourceTitle: resourceName,
          repositoryTitle: repository,
        }
      })
    }
  }

  //--------------------------------------------------------------------

  async updateDataModelFields(resourceName: string, userId: string, repository: string, dataModel: Record<string, Array<string>>) {
    //step 0: Only an ADMIN of this repository

    const access = await this.repositoryService.authenticateUserRequest(userId, repository, 2);
    if(access == false) {
      return //throw authentication error
    }


    console.log("Name" + resourceName);

    //step 1: Grab the current datamodel to see what is different
    const currentDataModel: Record<string, Array<string>> = await this.returnDataModelExact(resourceName, false);

    const currKeys = Object.keys(currentDataModel);
    const newKeys = Object.keys(dataModel);

    Object.keys(currentDataModel).forEach((fieldName) => {
      currentDataModel[fieldName].push("c" + md5(fieldName));
    })
    Object.keys(dataModel).forEach((fieldName) => {
      dataModel[fieldName].push("c" + md5(fieldName));
    })

    console.log(currKeys);
    console.log(newKeys);

    const createNewInput = [];
    const deleteInput = [];
    const changeDatatypeToText = [];
    const changeDatatypeToNumeric = [];

    let alterInputOne = currKeys.map((key) => {
      console.log(key);
      console.log(newKeys);
      console.log(newKeys.includes(key));

      console.log("one going to transform key" + key + " info " + currentDataModel[key][0]);
      const localizedFieldName = "c" + md5(currentDataModel[key][0]);
      console.log("equal next?" + localizedFieldName);
      console.log("equal above?" + currentDataModel[key][1]);
      if(newKeys.includes(key)) {
        //if this key is present in the new datamodel, check if the data type is the same
        if(currentDataModel[key][0] !== dataModel[key][0]) {
          dataModel[key][0] == "text" ? changeDatatypeToText.push(key) : changeDatatypeToNumeric.push(key);
          return `ALTER COLUMN "${currentDataModel[key][1]}" TYPE ${dataModel[key][0]} USING ${currentDataModel[key][1]}::${dataModel[key][0]}`;
        } else {
          return "$R" //signal to remove this entry and its comma from the final string
        }
      } else {
        //this is an entry that is in the CURRENT DATA MODEL, but NOT THE NEW ONE. Drop it
        deleteInput.push("'"+key+"'");
        return `DROP COLUMN ${currentDataModel[key][1]}`
      }
    }).toString();

    /**
     * After alterInputOne, we have accounted for all elements IN current that are NOT in new keys. Now, we must go the other way,
     * in order to determine what columns to ADD
     */
    let alterInputTwo = newKeys.map((key) => {
      console.log("going to transform key" + key + " into " + dataModel[key])


      if(!(currKeys.includes(key))) {
        createNewInput.push({
          fieldName: key,
          dataType: dataModel[key][0],
          localizedName: dataModel[key][1],
        });
        return `ADD COLUMN IF NOT EXISTS "${dataModel[key][1]}" ${dataModel[key][0]}`;
      } else {
        return "$R"
      }
    }).toString()

    console.log(alterInputOne);
    console.log(alterInputTwo);

    //TODO: FIX THIS LOOOL

    alterInputOne = alterInputOne.replace(/\$R,/g, "").replace(/\$R/g, "");
    alterInputTwo = alterInputTwo.replace(/\$R,/g, "").replace(/\$R/g, "");

    //final test, remove all trailing commas
    if(alterInputOne.charAt(alterInputOne.length - 1) == ",") {
      alterInputOne = alterInputOne.slice(0,-1);
    }
    if(alterInputTwo.charAt(alterInputTwo.length - 1) == ",") {
      alterInputTwo = alterInputTwo.slice(0,-1);
    }

    console.log(alterInputOne);
    console.log(alterInputTwo);

    const createManyInput = Object.entries(dataModel).map((fieldInfo) => {
      return {
        fieldName: fieldInfo[0],
        dataType: fieldInfo[1][0],
        localizedName: fieldInfo[1][1],
      };
    });

    console.log("original create many : " + createManyInput);

    const deleteManyInput = Object.entries(dataModel).map((fieldInfo) => {
      return `'${fieldInfo[0]}'`
    }).toString();

    /**
     * [1][1] refers to the Localized Name property
     * [0] refers to the Field Display Name property
     * [1][0] refers to the Field Data Type property
     */

    // //If the number of columns has increased, reflect changes accordingly
    // const alterTableAddColumn = Object.entries(dataModel).map((fieldInfo) => {
    //     return `ADD COLUMN IF NOT EXISTS "${fieldInfo[1][1]}" ${fieldInfo[1][0]}`;
    // }).toString();

    // //If the types of any columns have changed, reflect changes accordingly
    // //Using, along with field0::dataType allows us to automatically cast each entry to the new type, if possible
    // const alterTableChangeColumnDataType = Object.entries(dataModel).map((fieldInfo) => {
    //     return `ALTER COLUMN "${fieldInfo[1][1]}" TYPE ${fieldInfo[1][0]} USING ${fieldInfo[1][1]}::${fieldInfo[1][0]}`;
    // }).toString()

    //

    // console.log("createMany " + createManyInput)
    // console.log("deleteMany " + deleteManyInput)

    console.log("create: " + createNewInput);
    console.log("delete: " + deleteInput);

    /**
     * Here I ran into another problem with prisma. The "upsert" action allows me to EITHER update OR add new records. However, unlike create,
     * update, and delete, there is NO upsertAll. As of Jan/20/2022 this is still not a feautre of prisma
     * https://github.com/prisma/prisma/issues/5066
     * Therefore, we must use a PUT method and delete everything then re-create it
     */
    const transactionArray = [];
    if(deleteInput.length >= 1) {
      console.log(`DELETE FROM universe."ResourceField" WHERE "fieldName" in (${deleteInput})`);
      transactionArray.push(this.prisma.$executeRaw(`DELETE FROM universe."ResourceField" WHERE "fieldName" in (${deleteInput})`));
    }
    if(createNewInput.length >= 1) {
      transactionArray.push(this.prisma.resource.update({
        where: {
          title: resourceName,
        },
        data: {
          fields: {
            createMany: {
              data: createNewInput,
            }
          }
        }
      }));
    }
    if(changeDatatypeToNumeric.length >= 1) {
      transactionArray.push(this.prisma.resource.update({
        where: {
          title: resourceName,
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
    if(changeDatatypeToText.length >= 1) {
      transactionArray.push(this.prisma.resource.update({
        where: {
          title: resourceName,
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

    if(alterInputOne.length >= 1) {
      console.log(`ALTER TABLE datastore."${resourceName}" ${alterInputOne}`)
      transactionArray.push(this.prisma.$executeRaw(`ALTER TABLE datastore."${resourceName}" ${alterInputOne}`));
    }
    if(alterInputTwo.length >= 1) {
      console.log(`ALTER TABLE datastore."${resourceName}" ${alterInputTwo}`)
      transactionArray.push(this.prisma.$executeRaw(`ALTER TABLE datastore."${resourceName}" ${alterInputTwo}`));
    }
    // this.prisma.resourceField.updateMany({
    //     where: {
    //         id: {
    //             in: adf
    //         }
    //     },
    //     data: {
    //         dataType:
    //     }

    // })

    //     const [newDataModelRecord, ] = await this.prisma.$transaction([
    //        //statement 1
    //         this.prisma.$executeRaw(`DELETE FROM universe."ResourceField" WHERE "fieldName" in (${deleteInput})`),
    //         this.prisma.resource.update({
    //             where: {
    //                 title: resourceName,
    //             },
    //             data: {
    //                 fields: {
    //                     createMany: {
    //                         data: createNewInput,
    //                     }
    //                 }
    //             }
    //         }),
    //         //ALTER TABLE DROP COLUMNS
    //         this.prisma.$executeRaw(`ALTER TABLE datastore."${resourceName}" ${alterInputOne}`),
    //         alterInputTwo.length > 1 ? this.prisma.$executeRaw(`ALTER TABLE datastore."${resourceName}" ${alterInputTwo}`) : undefined
    //         //this.prisma.$executeRaw(`ALTER TABLE`)

    //         //TODO: don't run the alter table statment if the string is empty
    //         //fix all the random bugs that shouldnt be there
    //    ])

    const [newDataModelRecord, ] = await this.prisma.$transaction(transactionArray);

    return newDataModelRecord;

  }

  //--------------------------------------------------------------------

  async deleteDataModel(resourceName: string, userId: string, repository: string) {
    //step 0: Only the OWNER of the ORIGINAL REPOSITORY (need to code that) can delete this resource
    const access = await this.repositoryService.authenticateUserRequest(userId, repository, 3);
    if(access == false) {
      return //throw authentication error
    }


    //transaction steps: delete the data model record itself
    //delete the table storing the data itself
    return this.prisma.$transaction([
      //statement 1: have to use raw sql because prisma does not support cascading delete
      this.prisma.$executeRaw(`DELETE FROM universe."Resource" WHERE title = '${resourceName}'`),
      this.prisma.$executeRaw(`DROP TABLE datastore."${resourceName}"`)

      //step 2: delete the table inside of the datastore schema in the same way
    ])
  }



}
