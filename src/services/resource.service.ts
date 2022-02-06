import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { UserService } from "./user.service";
import { Readable } from "stream";
import * as readline from "readline";
import { performance } from "perf_hooks";
import { RepositoryService } from "./repository.service";
import { parseAsync } from "json2csv";
import { SeedDatabaseInputDTO } from "../resolvers/resource/dto/seed-database.dto";
import { RepositoryPermissions } from "../constants/permission-level-constants";
import { ResourceBusinessErrors } from "../errors/resource.error";
import { Resource, ResourceField } from "@prisma/client";


@Injectable()
export class ResourceService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private repositoryService: RepositoryService
  ) {
  }

  /**
   *
   * @param file
   * @param seedResourceDto
   * @param userId
   */
  async seedResourceFromFile(file: Express.Multer.File, seedResourceDto: SeedDatabaseInputDTO, userId: string) {

    //step 1: get the datamodel of the resource this user is looking to seed
    //admin is required to read/write
    const access = await this.repositoryService.authenticateUserRequest(userId, seedResourceDto.repository, 2);
    if (access == false) {
      return; // throw authentication error
    }

    const dataModel = await this.prisma.resource.findUnique({
      where: {
        title: seedResourceDto.resourceName
      },
      include: {
        fields: true,
        repositories: true
      }
    });

    const buf = file.buffer;
    console.log(buf.toString());

    //step 2: authenticate the request, does this user have WRITE priviledges for this resource under this repository?


    console.log(dataModel);

    console.log(dataModel.fields);

    //const insertValueBufferSize = 500; //number of rows to queue up before pushing to DB
    let lNum = 0;
    try {
      const rl = readline.createInterface({
        input: Readable.from(buf),
        crlfDelay: Infinity
      });


      const fieldNames = [];
      const inputColumnOrderIndex = [];
      let insertArgumentsOne = "";
      const insertBuffer = [];
      const sst = performance.now();
      for await (const line of rl) {
        if (lNum == 0) {

          /**
           * Here we must account for a potential discrepancy between the stored schema and the incoming seed data.
           * The schema should not require that the order of the columns in the incoming data is exactly the same.
           * That is, if a user rearranges the location of their columns before uploading data, it should not
           * break the process. Therefore, we must account for the potential differences in the order of data
           */

          line.split(seedResourceDto.delimiter).forEach((field) => {
            console.log("LINE SPLIT" + field);
            fieldNames.push(field);
          });

          //console.log("field names " + fieldNames);
          let localizedFields = "";
          fieldNames.forEach((field) => {
            const fieldIdx = dataModel.fields.findIndex((obj) => {
              return obj.fieldName == field;
            });
            inputColumnOrderIndex.push(fieldIdx);
            console.log(fieldIdx);
            //console.log(dataModel.fields[fieldIdx].fieldName + " with ln " + dataModel.fields[fieldIdx].localizedName);
            localizedFields += (dataModel.fields[fieldIdx].localizedName + ",");
          });
          //TODO: Can this read by column please!?!??
          insertArgumentsOne = `datastore."${dataModel.title}" ( ${localizedFields.slice(0, -1)} )`; //remove trailing comma

          console.log(insertArgumentsOne);


          //TODO: Do we have to delete all existing data or can we implement PATCH
          await this.prisma.$executeRaw(`DELETE FROM datastore."${dataModel.title}"`);


        } else {
          const lineData = line.split(seedResourceDto.delimiter).map((fieldDataValue, idx) => {
            const dt = dataModel.fields[inputColumnOrderIndex[idx]].dataType;
            return dt === "text" ? "'" + fieldDataValue + "'" : Number(fieldDataValue);
          });
          insertBuffer.push(`(${lineData})`);


          if (lNum % seedResourceDto.maxBufferSize == 0) {
            // console.log(line)
            // const bruh = line.split(',')[0];
            // console.log(typeof bruh)
            // console.log(bruh)
            // console.log(`INSERT INTO universe."CopyExample" (field1, field2, field2) VALUES (${line.split(',')[0]}, ${line.split(',')[1]}, ${line.split(',')[2]})`);
            //const st = performance.now()
            // delimiters other than ,???
            // const lineData = line.split(',').map((fieldDataValue, idx) => {
            //     //console.log("fdv " + fieldDataValue);
            //     const dt = dataModel.fields[inputColumnOrderIndex[idx]].dataType;
            //     //console.log("Line 585 data model " + dt);
            //     return dt === "text" ? "'"+fieldDataValue+"'" : Number(fieldDataValue);
            //     //
            //     // const dtObj = dataModel.fields.find((obj) => { return obj.fieldName == fieldDataValue});
            //     //
            //     // console.log("dtObj " + dtObj);
            //     // return dtObj.fieldName === "text" ? "'"+dtObj.fieldName+"'" : Number(dtObj.fieldName);
            //
            //     // const dt = dataModel.fields[idx].dataType;
            //     // return dt === "text" ? "'"+fieldDataValue+"'" : Number(fieldDataValue);
            // });

            const insertArgs = `${insertArgumentsOne} VALUES ${insertBuffer}`;
            //console.log("INSERT INTO " + insertArgs);
            await this.prisma.$executeRaw("INSERT INTO " + insertArgs);
            //await this.prisma.$executeRaw`INSERT INTO universe."CopyExample" (field1, field2, field3) VALUES (${Number(line.split(',')[0])}, ${Number(line.split(',')[1])}, ${Number(line.split(',')[2])})`
            //await this.prisma.$executeRaw`INSERT INTO universe."CopyExample" (field1, field2, field3) VALUES (${line.split(',')[0]}, ${line.split(',')[1]}, ${line.split(',')[2]})`
            //const et = performance.now()
            //console.log("Milliseconds: " + (et-st));

            //don't forget to forget the buffer
            insertBuffer.length = 0;
          }
        }
        lNum++;
      }
      //empty the remaining buffer
      if (insertBuffer.length >= 1) {

        const insertArgs = `${insertArgumentsOne} VALUES ${insertBuffer}`;
        console.log(insertArgs);
        await this.prisma.$executeRaw("INSERT INTO " + insertArgs);
      }

      console.log(lNum);

      console.log(`Field Names: ${fieldNames}`);
      const eet = performance.now();

      console.log("Total time: " + (eet - sst) / 1000);

    } catch (err) {
      console.log(err);
      console.log(lNum);
      const msg = err.message + ". This error occurred while reading lines between " + (lNum - seedResourceDto.maxBufferSize) + " and " + lNum + " of the seed file";
      console.log(msg);
      return msg;
    }
    return;


  }

  /**
   * @method queryResource:
   *
   * @param resourceName
   * @param userId
   * @param repository
   * @param sqlSelect
   * @param sqlWhereFields
   * @param sqlWhere
   */
  async queryResource(resourceName: string, userId: string, repository: string, sqlSelect: string, sqlWhereFields: string, sqlWhere: string) {
    //step 0: potentially sanitize sql statement
    // if(sqlWhere.includes("User") || sqlWhere.includes(";") || sqlWhere.includes("password")) {
    //     return;
    // }

    console.log(resourceName);
    console.log(userId);
    console.log(repository);
    console.log(sqlSelect);
    console.log(sqlWhere);


    //step 1: authenticate this request
    await this.repositoryService.authenticateUserRequest(userId, repository, RepositoryPermissions.REPOSITORY_USER);


    /**
     * Account for multiple cases: User may want to select all of their fields (select *) without having to type them all out
     */
    let includeFieldArgs;
    if (sqlSelect === "*") {
      console.log("select all");
      includeFieldArgs = {
        select: {
          fieldName: true,
          localizedName: true
        }
      };
    } else {
      //step
      //remove spaces
      let fieldNameFindArgs = sqlSelect.replace(/\s+/g, "").split(",");
      /**
       * Accounting for edge case: What if the user doesn't include a field in their SELECT statement, but uses that field in thier
       * WHERE statement?
       */
      fieldNameFindArgs = fieldNameFindArgs.concat(sqlWhereFields.replace(/\s+/g, "").split(","));
      console.log(fieldNameFindArgs);
      includeFieldArgs = {
        where: {
          fieldName: {
            in: fieldNameFindArgs
          }
        },
        select: {
          fieldName: true,
          localizedName: true
        }
      };
    }


    //step 2: grab the datamodel associated with the resource
    /**
     * Although this query uses .findMany, it will only return a single resource.
     * We want THE resource with the user input title, but ONLY IF that resource is in the user supplemented repository
     * Otherwise, the query fails
     * When the query succeeds, we only need the "fieldName" and "localizedName" attributes of each of the fields
     * Therefore, the map of relations is REPOSITORY -> RESOURCE -> RESOURCE_FIELD
     * We want to grab a resource that is certainly in the given repository, by a certain name, and return only 2 fields from the RESOURCE_FIELD data
     * There is another way to do this (search REPOSITORY instead of resource and go "down" the relation tree), but this is equivalent
     */
    const resourceAndSelectedFields = await this.prisma.resource.findMany({
      where: {
        AND: [
          { title: resourceName },
          { repositories: { some: { repositoryTitle: repository } } }
        ]
      },
      include: {
        //include only the fields that are included in the user's SELECT statement, generated above
        fields: includeFieldArgs
      }
    });

    console.log(resourceAndSelectedFields);

    const localizedSelect = resourceAndSelectedFields[0].fields.map((value) => {
      return value.localizedName;
    });


    resourceAndSelectedFields[0].fields.forEach((value) => {
      sqlWhere = sqlWhere.replace(value.fieldName, value.localizedName);
      console.log(sqlWhere);
    });

    console.log(sqlWhere);

    console.log("SELECT " + localizedSelect + " FROM " + "datastore.\"" + resourceName + "\" " + sqlWhere + ";");
    const payload = await this.prisma.$queryRaw("SELECT " + localizedSelect + " FROM " + "datastore.\"" + resourceName + "\" " + sqlWhere + ";");
    const csvPayload = await parseAsync(payload);
    //pass in limit, only split first line
    let headerLine = csvPayload.split("\n", 1)[0];
    resourceAndSelectedFields[0].fields.forEach((value) => {
      headerLine = headerLine.replace(value.localizedName, value.fieldName);
    });
    console.log("---");
    console.log("headerLine " + headerLine);

    // console.log(("\n" + csvPayload.substring(csvPayload.indexOf("\n") + 1)));
    // console.log(csvPayload.substring(csvPayload.indexOf("\n") + 1));


    return headerLine + ("\n" + csvPayload.substring(csvPayload.indexOf("\n") + 1));
  }

  //----------------------------------------------------------------------------------------
  // OTHER FUNCTIONALITY
  //----------------------------------------------------------------------------------------

  /**
   * @method Returns the requested resource, or throws an exception either if the resource doesn't exist, or if it is not
   * accessible from the input repository.
   *
   * @param repositoryName
   * @param resourceName
   * @throws ForbiddenException if the resource exists, but is not accessible by the input repository
   * @throws NotFoundException if the resource does not exist
   */
  async validateResourceExistence(repositoryName: string, resourceName: string) {
    const resourceFromTitle = await this.prisma.resource.findUnique({
      where: {
        title: resourceName
      }
    });
    if (!resourceFromTitle) {
      throw new NotFoundException(ResourceBusinessErrors.ResourceNotFound);
    }
    const resourceOnRepository = await this.prisma.resourcesOnRepositories.findUnique({
      where: {
        resourceTitle_repositoryTitle: {
          repositoryTitle: repositoryName,
          resourceTitle: resourceName
        }
      }
    });
    if (!resourceOnRepository) {
      throw new ForbiddenException(ResourceBusinessErrors.ResourceNotInRepository);
    } else {
      return resourceFromTitle;
    }
  }

  //----------------------------------------------------------------------------------------

  /**
   * @method returns the requested resource field. Throws an exception if it does not exist within the supplied resource
   *
   * @param resourceName
   * @param resourceFieldName
   * @throws NotFoundException the resource field may exist, but not within the supplied resource.
   */
  async validateResourceFieldExistence(resourceName: string, resourceFieldName: string): Promise<Resource & {fields: ResourceField[]}> {
    const resourceFieldFromResource = await this.prisma.resource.findUnique({
      where: {
        title: resourceName,
      },
      include: {
        fields: {
          where: {
            fieldName: resourceFieldName
          }
        }
      }
    })
    if(!resourceFieldFromResource) {
      throw new NotFoundException(ResourceBusinessErrors.ResourceFieldNotFound)
    } else {
      return resourceFieldFromResource;
    }

  }


}



