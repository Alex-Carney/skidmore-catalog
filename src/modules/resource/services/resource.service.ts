import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { Response } from 'express';
import { Readable } from "stream";
import * as readline from "readline";
import { performance } from "perf_hooks";
import { parseAsync } from "json2csv";
import { SeedDatabaseInputDTO } from "../dto/seed-database.dto";
import { RepositoryPermissions } from "../../repository/constants/permission-level-constants";
import { ResourceBusinessErrors } from "../errors/resource.error";
import { Multer } from 'multer' // THIS IS NOT ACTUALLY UNUSED. DO NOT DELETE.
import { RepositoryValidation } from "../../repository/validation/repository.validation";
import { ResourceValidation } from "../validation/resource.validation";
import { CustomException } from "../../../errors/custom.exception";
import { PrismaService } from "../../prisma/services/prisma.service";


@Injectable()
export class ResourceService {
  /**
   * @service An injectable service handling all operations relating to resources
   *
   * @param prisma
   * @param repositoryValidation
   * @param resourceValidation
   */
  constructor(
    private prisma: PrismaService,
    private repositoryValidation: RepositoryValidation,
    private resourceValidation: ResourceValidation,
  ) {
  }

  private readonly logger = new Logger(ResourceService.name);

  /**
   * Reads a valid input file and inputs the data from the file into the database accordingly
   *
   * @param file
   * @param seedResourceDto
   * @param userId
   * @param res
   */
  async seedResourceFromFile(file: Express.Multer.File, seedResourceDto: SeedDatabaseInputDTO, userId: string, res: Response) {


    /**
     * All 4 of these validation calls were supposed to be replaced with middleware and
     * guards. This worked for every other method in the API. Unfortunately, it doesn't work
     * here because the API route uses form-data instead of json in its body.
     */
    await this.resourceValidation.validateResourceExistence(seedResourceDto.resourceName);
    await this.repositoryValidation.validateRepositoryExistenceError(seedResourceDto.repository);
    await this.repositoryValidation.authenticateUserRequest(userId, seedResourceDto.repository, RepositoryPermissions.REPOSITORY_ADMIN);
    await this.resourceValidation.validateResourceAccessFromRepository(seedResourceDto.repository, seedResourceDto.resourceName);

    /**
     * These validation calls would be better with the type transformer package,
     * but that isn't working with NestJs as of 4/1/2022
     */
    await this.resourceValidation.validateBufferSizeInput(seedResourceDto.maxBufferSize);
    await this.resourceValidation.validateDelimiterInput(seedResourceDto.delimiter);

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

    // fail early: if the file is of the wrong encoding, immediately throw exception
    await this.resourceValidation.validateFiletype(file.mimetype);

    //step 2: authenticate the request, does this repository have WRITE priviledges for this resource under this repository?
    this.logger.log(dataModel);

    this.logger.log(dataModel.fields);

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

          // Remove extra BOM character
          const cleanedLine = line.replace(`\ufeff`, "");

          /**
           * Here we must account for a potential discrepancy between the stored schema and the incoming seed data.
           * The schema should not require that the order of the columns in the incoming data is exactly the same.
           * That is, if a repository rearranges the location of their columns before uploading data, it should not
           * break the process. Therefore, we must account for the potential differences in the order of data
           */

          cleanedLine.split(seedResourceDto.delimiter).forEach((field) => {
            this.logger.log("LINE SPLIT" + field);
            fieldNames.push(field);
          });

          //this.logger.log("field names " + fieldNames);
          let localizedFields = "";
          fieldNames.forEach((field) => {
            const fieldIdx = dataModel.fields.findIndex((obj) => {
              return obj.fieldName == field;
            });
            if(fieldIdx == -1) {
              throw new CustomException(ResourceBusinessErrors.InvalidInputFile,
                `Invalid field: ${field != "" ? field : "EMPTY FILE"} did not match data model.`,
                HttpStatus.BAD_REQUEST)
            }
            inputColumnOrderIndex.push(fieldIdx);
            this.logger.log(fieldIdx);
            //this.logger.log(dataModel.fields[fieldIdx].fieldName + " with ln " + dataModel.fields[fieldIdx].localizedName);
            localizedFields += (dataModel.fields[fieldIdx].localizedName + ",");
          });
          //TODO: Can this read by column please!?!??
          insertArgumentsOne = `datastore."${dataModel.title}" ( ${localizedFields.slice(0, -1)} )`; //remove trailing comma

          this.logger.log(insertArgumentsOne);

          await this.prisma.$executeRaw(`DELETE FROM datastore."${dataModel.title}"`);


        } else {
          const lineData = line.split(seedResourceDto.delimiter).map((fieldDataValue, idx) => {
            const dt = dataModel.fields[inputColumnOrderIndex[idx]].dataType;
            return dt === "text" ? "'" + fieldDataValue + "'" : Number(fieldDataValue);
          });
          insertBuffer.push(`(${lineData})`);


          if (lNum % seedResourceDto.maxBufferSize == 0) {
            const insertArgs = `${insertArgumentsOne} VALUES ${insertBuffer}`;
            await this.prisma.$executeRaw("INSERT INTO " + insertArgs);
            //don't forget to forget the buffer
            insertBuffer.length = 0;
          }
        }
        lNum++;
      }
      //empty the remaining buffer
      if (insertBuffer.length >= 1) {

        const insertArgs = `${insertArgumentsOne} VALUES ${insertBuffer}`;
        this.logger.log(insertArgs);
        await this.prisma.$executeRaw("INSERT INTO " + insertArgs);
      }

      this.logger.log(lNum);
      this.logger.log(`Field Names: ${fieldNames}`);
      const eet = performance.now();
      const successMessage: string = "Total time: " + (eet - sst) / 1000 + " sec";
      this.logger.log(successMessage);

      res.status(HttpStatus.OK).send("Successfully seeded data model. " + successMessage)
      return "Successfully seeded data model. " + successMessage

    } catch (err) {
      if(err instanceof CustomException) {
        res.status(HttpStatus.BAD_REQUEST).send(err.getResponse());
      }
      this.logger.log(err);
      this.logger.log(lNum);
      const msg = err.message + ". This error occurred while reading lines between " + (lNum - seedResourceDto.maxBufferSize) + " and " + lNum + " of the seed file";
      this.logger.log(msg);
      return msg;
    }
    // const successMessage: String = "Successfully seeded data model. Total time: " +
    // res.status(HttpStatus.OK).send("success")
    // return "";
  }

  /**
   * @method queryResource: User inputs an SQL query and receives a data payload back.
   * The user must have the 'user' role of the repository that this is a part of, which
   * is validated by the controller already
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
    if(sqlWhere.includes("User") || sqlWhere.includes(";") || sqlWhere.includes("password")) {
        return;
    }

    this.logger.log(resourceName);
    this.logger.log(userId);
    this.logger.log(repository);
    this.logger.log(sqlSelect);
    this.logger.log(sqlWhere);

    /**
     * Account for multiple cases: User may want to select all of their fields (select *) without having to type them all out
     */
    let includeFieldArgs;
    if (sqlSelect === "*") {
      this.logger.log("select all");
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
       * Accounting for edge case: What if the repository doesn't include a field in their SELECT statement, but uses that field in thier
       * WHERE statement?
       */
      fieldNameFindArgs = fieldNameFindArgs.concat(sqlWhereFields.replace(/\s+/g, "").split(","));
      this.logger.log(fieldNameFindArgs);
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
     * We want THE resource with the repository input title, but ONLY IF that resource is in the repository supplemented repository
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
        //include only the fields that are included in the repository's SELECT statement, generated above
        fields: includeFieldArgs
      }
    });

    this.logger.log(resourceAndSelectedFields);

    const localizedSelect = resourceAndSelectedFields[0].fields.map((value) => {
      return value.localizedName;
    });


    resourceAndSelectedFields[0].fields.forEach((value) => {
      sqlWhere = sqlWhere.replace(value.fieldName, value.localizedName);
      this.logger.log(sqlWhere);
    });

    this.logger.log(sqlWhere);

    this.logger.log("SELECT " + localizedSelect + " FROM " + "datastore.\"" + resourceName + "\" " + sqlWhere + ";");
    const payload = await this.prisma.$queryRaw("SELECT " + localizedSelect + " FROM " + "datastore.\"" + resourceName + "\" " + sqlWhere + ";");
    const csvPayload = await parseAsync(payload);
    //pass in limit, only split first line
    let headerLine = csvPayload.split("\n", 1)[0];
    resourceAndSelectedFields[0].fields.forEach((value) => {
      headerLine = headerLine.replace(value.localizedName, value.fieldName);
    });
    this.logger.log("---");
    this.logger.log("headerLine " + headerLine);

    return headerLine + ("\n" + csvPayload.substring(csvPayload.indexOf("\n") + 1));
  }

  //----------------------------------------------------------------------------------------
}



