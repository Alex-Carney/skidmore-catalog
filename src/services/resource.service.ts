import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { UserService } from "./user.service";
import { Request, response } from "express";
import { Readable } from "stream";
import * as readline from "readline";
import { performance } from "perf_hooks";
import { DataModelGenerateInputDTO } from "src/resolvers/resource/dto/data-model-input.dto";
import { DataModelPublishInputDTO } from "src/resolvers/resource/dto/data-model-publish.dto";
import { title } from "process";
import { RoleService } from "./role.service";
//import {md5} from "md5";
import * as md5 from 'md5';


@Injectable()
export class ResourceService {
    constructor(
        private prisma: PrismaService,
        private userService: UserService,
        private roleService: RoleService,
    ) {}

    /**
     * 
     * @param file 
     * @param dataModelInput 
     * @returns 
     */
    async generateDataModel(file: Express.Multer.File) {
        const buf = file.buffer;
        try {
            const rl = readline.createInterface({
                input: Readable.from(buf),
                crlfDelay: Infinity,
            });

            

            let lNum = 0;
            const fieldsNames = new Array<string>(); 
            const fields = new Map<string, Array<string>>(); //This map tracks the relationship between a column's name and its datatype
            for await (const line of rl) {
                //the first line must be the header -- containing the fields 
                if(lNum == 0) {
                    line.split(',').forEach((field) => {
                        //Postgres has column name requirements. No special characters allowed, lower case preferred 
                        //remove non-letter leading chars
                        //field = field[0].replace(/[^a-zA-Z]/g, "") + field.substring(1).replace(/[^a-zA-Z0-9 _]/g, "").toLowerCase();
                        //UPDATE: separate display and localized names 
                        fieldsNames.push(field);
                    });
                } else {
                    //this could very well be a nested while instead, but i'd rather do it this way 
                    if(fields.size < fieldsNames.length) {
                        line.split(',').forEach((element, index) => {
                            // console.log(typeof element);
                            //Three possibilities: Not a number, a number, or "". 
                            if(element !== "") {
                                fields.set(fieldsNames[index], [Number.isNaN(Number(element)) ? "text" : "numeric", "c" + md5(fieldsNames[index])]);
                            }
                            //ignore null fields, but keep looping through the file until there are none left  
                        });
                    } else {
                        break;
                    }
                }
                lNum++;
            }
            console.log({fields});
            return this.mapToObj(fields);
        } catch(err) {
            console.log(err);
        }
        
    }

    /**
     * not my code https://stackoverflow.com/questions/37437805/convert-map-to-json-object-in-javascript
     * with some slight modifications
     * @param inputMap 
     * @returns 
     */
    mapToObj(inputMap: Map<string, Array<string>>) {
        const obj = {};
        inputMap.forEach((v, k) => {
            obj[k] = v;
        })
        return obj;
    }

    /**
     * Publishes the data model as a "Resource" object in the database. Also generates the "ResourceField" objects that store the localized name
     * and data type. 
     * Also creates an empty table in another section of the DB that will eventually be seeded with data by the user 
     * 
     * @param dataModel: Returned from the "generateDataModel" method. Contains a record of column display name to column localized name and datatype
     * @param resourceName Name of resource to be published
     * @param userId User who is publishing the resource (mainly for logging purposes)
     * @returns The record of the newly created resource, including the auto-generated ResourceField objects
     */
    async publishDataModel(dataModel: Record<string, Array<string>>, resourceName: string, userId: string, repositories: string[]) {
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
         * The repositories are added to the explicit ResourcesOnRoles m-n relation in the transaction below
         */
        const connectManyInput = repositories.map((repository) => {
            // return {
            //     resourceTitle_roleTitle: {
            //         resourceTitle: resourceName,
            //         roleTitle: repository,
            //     }
            // };
            return {
                roleTitle: repository,
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
                    roles: {
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
                    fields: true,
                }
            }),
            //statement 3
            this.prisma.$executeRaw("CREATE TABLE " + tableArguments),
        ]);
        return dataModelRecord;
    }

    returnDataModels(repository: string) {
        return this.prisma.resource.findMany({
            where: {
                roles: {
                    some: {
                        roleTitle: repository,
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
                roles: {
                    select: {
                        roleTitle: true,
                    }
                }
            }
        });
    }

    async returnDataModelExact(resourceName: string, asMap: boolean) {
        const fieldInfo = await this.prisma.resource.findUnique({
            where: {
                title: resourceName,
            },
            include: {
                fields: true,
            }
        })

        const fieldMap = new Map<string, Array<string>>();
        fieldInfo.fields.forEach((field) => {
            fieldMap.set(field.fieldName, [field.dataType, field.localizedName])
        })

        return asMap ? fieldMap : this.mapToObj(fieldMap);
    }

    async updateDataModelRepositories(resourceName: string, userId: string, repository: string, remove: boolean) {
        const access = await this.authenticateUserRequest(userId, repository, 2);
        if(access == false) {
            return //throw authentication error
        }

        const updateArgs = remove ? 
        {disconnect: {resourceTitle_roleTitle: {resourceTitle: resourceName, roleTitle: repository}}} 
        : {connect: {resourceTitle_roleTitle: {resourceTitle: resourceName, roleTitle: repository}}}; 
  
        return this.prisma.resource.update({
            where: {
                title: resourceName,
            },
            data: {
                roles: updateArgs
            }
        })
    }

    async updateDataModelFields(resourceName: string, userId: string, repository: string, dataModel: Record<string, Array<string>>) {
       //step 0: Only an ADMIN of this repository

       const access = await this.authenticateUserRequest(userId, repository, 2);
       if(access == false) {
           return //throw authentication error
       }

       console.log("Name" + resourceName);
       
       //step 1: Grab the current datamodel to see what is different
       const currentDataModel: Record<string, Array<string>> = await this.returnDataModelExact(resourceName, false); 

       const currKeys = Object.keys(currentDataModel);
       const newKeys = Object.keys(dataModel);

       console.log(currKeys);
       console.log(newKeys);

       let alterInputOne = currKeys.map((key) => {
            console.log(key);
            console.log(newKeys);
            console.log(newKeys.includes(key));

            if(newKeys.includes(key)) {
                //if this key is present in the new datamodel, check if the data type is the same
                if(currentDataModel[key][0] !== dataModel[key][0]) {
                    return `ALTER COLUMN "${currentDataModel[key][1]}" TYPE ${dataModel[key][0]} USING ${currentDataModel[key][1]}::${dataModel[key][0]}`;
                } else {
                    return "$R" //signal to remove this entry and its comma from the final string
                }
            } else {
                //this is an entry that is in the CURRENT DATA MODEL, but NOT THE NEW ONE. Drop it
                return `DROP COLUMN ${currentDataModel[key][1]}`
            }
       }).toString();

       /**
        * After alterInputOne, we have accounted for all elements IN current that are NOT in new keys. Now, we must go the other way,
        * in order to determine what columns to ADD
        */
       let alterInputTwo = newKeys.map((key) => {
            if(!(currKeys.includes(key))) {
                return `ADD COLUMN IF NOT EXISTS "${dataModel[key][1]}" ${dataModel[key][0]}`;
            } else {
                return "$R"
            }
       }).toString()

       console.log(alterInputOne);
       console.log(alterInputTwo);

       alterInputOne = alterInputOne.replace(/\$R,/g, "").replace(/\$R/g, "");
       alterInputTwo = alterInputTwo.replace(/\$R,/g, "").replace(/\$R/g, "");

       console.log(alterInputOne);
       console.log(alterInputTwo);

       return





       const createManyInput = Object.entries(dataModel).map((fieldInfo) => {
        return {
            fieldName: fieldInfo[0],
            dataType: fieldInfo[1][0],
            localizedName: fieldInfo[1][1],
        };
    });

    const deleteManyInput = Object.entries(dataModel).map((fieldInfo) => {
        return `'${fieldInfo[0]}'`
    }).toString();

    /**
     * [1][1] refers to the Localized Name property
     * [0] refers to the Field Display Name property
     * [1][0] refers to the Field Data Type property 
     */

    //If the number of columns has increased, reflect changes accordingly 
    const alterTableAddColumn = Object.entries(dataModel).map((fieldInfo) => {
        return `ADD COLUMN IF NOT EXISTS "${fieldInfo[1][1]}" ${fieldInfo[1][0]}`;
    }).toString();

    //If the types of any columns have changed, reflect changes accordingly 
    //Using, along with field0::dataType allows us to automatically cast each entry to the new type, if possible 
    const alterTableChangeColumnDataType = Object.entries(dataModel).map((fieldInfo) => {
        return `ALTER COLUMN "${fieldInfo[1][1]}" TYPE ${fieldInfo[1][0]} USING ${fieldInfo[1][1]}::${fieldInfo[1][0]}`;
    }).toString()

    //

    console.log(createManyInput)
    console.log(deleteManyInput)

    /**
     * Here I ran into another problem with prisma. The "upsert" action allows me to EITHER update OR add new records. However, unlike create, 
     * update, and delete, there is NO upsertAll. As of Jan/20/2022 this is still not a feautre of prisma
     * https://github.com/prisma/prisma/issues/5066
     * Therefore, we must use a PUT method and delete everything then re-create it 
     */
       const [newDataModelRecord, ] = await this.prisma.$transaction([
           //statement 1
            this.prisma.$executeRaw(`DELETE FROM universe."ResourceField" WHERE "fieldName" in (${deleteManyInput})`),
            this.prisma.resource.update({
                where: {
                    title: resourceName,
                },
                data: {
                    fields: {
                        createMany: {
                            data: createManyInput,
                        }
                    }
                }
            })
            //this.prisma.$executeRaw(`ALTER TABLE`)
       ])

       



    }

    async deleteDataModel(resourceName: string, userId: string, repository: string) {
        //step 0: Only the OWNER of the ORIGINAL REPOSITORY (need to code that) can delete this resource
       const access = await this.authenticateUserRequest(userId, repository, 3);
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


    async handleFile(file: Express.Multer.File, resourceName: string, userId: string, repository: string) {
        
        //step 1: get the datamodel of the resource this user is looking to seed

        const dataModel = await this.prisma.resource.findUnique({
            where: {
                    title: resourceName,
            },
            include: {
                fields: true,
                roles: true,
            }
        });
        
        const buf = file.buffer;
        console.log(buf.toString())

        //step 2: authenticate the request, does this user have WRITE priviledges for this resource under this repository? 
        

        console.log(dataModel);

        console.log(dataModel.fields);

        let localizedFields = "";
        dataModel.fields.forEach((field) => {
            localizedFields += (field.localizedName + ",")
        });
        const insertArgumentsOne = `datastore."${dataModel.title}" ( ${localizedFields.slice(0,-1)} )` //remove trailing comma


        console.log(localizedFields);

        console.log(insertArgumentsOne);

        try {
            const rl = readline.createInterface({
                input: Readable.from(buf),
                crlfDelay: Infinity
            });

            let lNum = 0;

            const fieldNames = [];
            const sst = performance.now()
            for await (const line of rl) {
                if(lNum == 0) {
                    line.split(',').forEach((field) => fieldNames.push(field));
                } else {
                    // console.log(line)
                    // const bruh = line.split(',')[0];
                    // console.log(typeof bruh)
                    // console.log(bruh)
                    // console.log(`INSERT INTO universe."CopyExample" (field1, field2, field2) VALUES (${line.split(',')[0]}, ${line.split(',')[1]}, ${line.split(',')[2]})`);
                    //const st = performance.now() 
                    //TODO: delimiters other than ,???
                    const lineData = line.split(',').map((fieldDataValue, idx) => {
                        const dt = dataModel.fields[idx].dataType;
                        return dt === "text" ? "'"+fieldDataValue+"'" : Number(fieldDataValue);
                    });

                    const insertArgs = `${insertArgumentsOne} VALUES (${lineData})`
                    //console.log("INSERT INTO " + insertArgs);
                    await this.prisma.$executeRaw("INSERT INTO " + insertArgs);
                    //await this.prisma.$executeRaw`INSERT INTO universe."CopyExample" (field1, field2, field3) VALUES (${Number(line.split(',')[0])}, ${Number(line.split(',')[1])}, ${Number(line.split(',')[2])})`
                    //await this.prisma.$executeRaw`INSERT INTO universe."CopyExample" (field1, field2, field3) VALUES (${line.split(',')[0]}, ${line.split(',')[1]}, ${line.split(',')[2]})`
                    //const et = performance.now()
                    //console.log("Milliseconds: " + (et-st));
                }
                lNum++;
            }

            console.log(`Field Names: ${fieldNames}`)
            const eet = performance.now()

            console.log("Total time: " + (eet - sst)/1000)

        } catch(err) {
            console.log(err);
        }
        return 
    

    }

    async queryResource(resourceName: string, userId: string, repository: string, sqlSelect: string, sqlWhere: string) {
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
        const access = await this.roleService.accessLevel(userId, repository);
        if(access['permissionLevel'] < 1) { //1 represents user
            return //throw authentication 403 error (try accessing from a different respository if you believe you should be able to access)
        }

        console.log(access);

        //step
        const fieldNameFindArgs = sqlSelect.replace(/\s+/g, '').split(',');
        console.log(fieldNameFindArgs);
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
                    {title: resourceName},
                    {roles: {some: {roleTitle: repository}}}
                ]
            },
            include: {
                //include only the fields that are included in the user's SELECT statement
                fields: {
                    where: { 
                        fieldName: {
                            in: fieldNameFindArgs
                        }
                    },
                    select: {
                        fieldName: true,
                        localizedName: true,

                    }
                },
            }
        });

        console.log(resourceAndSelectedFields);

        const localizedSelect = resourceAndSelectedFields[0].fields.map((value) => {
            return value.localizedName;
        });

        resourceAndSelectedFields[0].fields.forEach((value) => {
            sqlWhere = sqlWhere.replace(value.fieldName, value.localizedName);
        });

        console.log('SELECT ' + localizedSelect + ' FROM ' + 'datastore."' + resourceName + '" ' + sqlWhere + ';');
        return this.prisma.$queryRaw('SELECT ' + localizedSelect + ' FROM ' + 'datastore."' + resourceName + '" ' + sqlWhere + ';');
    }

    async authenticateUserRequest(userId: string, repository: string, requiredLevel: number): Promise<boolean> {
        const access = await this.roleService.accessLevel(userId, repository);
        if(access['permissionLevel'] < requiredLevel) { //2 represents admin
            return false //throw authentication 403 error (try accessing from a different respository if you believe you should be able to access)
        } else {
            return true
        }
    }














} 