/**
 * This class represents a standard database lookup service. Instead of statically defining a database-lookup service for every single feature \
 * (like we have for tully-group with tully-group.service), we can define a scaffold for a dynamic provider/service. We can configure a new 
 * instance of this class with options based on what resource we are implementing (that logic is done in the feature's module file)
 */

import { Injectable, Type } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { ResourceOptions, SdssOpticalOptions } from "./resource options/resource-options.interface";

/**
 * @constructor
 * This class represents a standard database lookup service. Instead of statically defining a database-lookup service for every single feature \
 * (like we have for tully-group with tully-group.service), we can define a scaffold for a dynamic provider/service. We can configure a new 
 * instance of this class with options based on what resource we are implementing (that logic is done in the feature's module file)
 */
@Injectable()
export class DatabaseLookupService<Resource extends ResourceOptions> {
    
    private resource: any

    constructor(private prisma: PrismaService, resource: any) { 
        this.resource = resource
    }

    async returnSingleById(whereUniqueInput: Resource['WhereUniqueType']): Promise<Resource['ReturnType'] | null> {
        return this.resource.findUnique({
            where: whereUniqueInput,
        });
    }

    async returnMultipleByQuery(
        params: {
        skip?: number;
        take?: number;
        cursor?: Resource['WhereUniqueType'];
        where?: Resource['WhereType'];
        orderBy?: Resource['OrderByType'];
    },
    select?: any,
    )//: Promise<Tully_Group[] | null> 
    {
        //BEFORE: ' : Promise<Tully_Group[]> ' was in between ) {
        //function starts here
        //deconstruct the params object
        //skip, take, cursor, where, orderBy are all parameters the user can query with? 
        const { skip, take, cursor, where, orderBy } = params;
        const selectSafe = new SelectHelpClass<Resource['SelectType']>().generateSelect(select)
        return this.resource.findMany({
            skip: skip,
            take: take,
            cursor: cursor,
            where: where,
            orderBy: orderBy,
            select: selectSafe,
        });
    } //end of galaxies 
    
    //simply returns all tully_groups 
    async returnAll(): Promise<Resource['ReturnType'][] | null> {
        return this.resource.findMany();
    }

    async customQuery(fields: string, query: string): Promise<Resource['ReturnType'][] | null> {
        console.log(`SELECT ${fields} FROM universe."${"idk"}" ${query}`)
        const result = await this.prisma.$queryRaw('SELECT ' + fields + ' FROM universe."Tully_Group" ' + query +';')
        return result;
    }
}
// https://github.com/prisma/prisma/issues/3372
// this was the only way i found how to do this.
class SelectHelpClass<SelectType> {
    /**
     * name
     */
    public generateSelect<T extends SelectType>(select: Prisma.Subset<T, SelectType>): T {
        return select; 
    }
} 


