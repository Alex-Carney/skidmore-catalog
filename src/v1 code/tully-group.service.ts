import { Injectable, Type } from '@nestjs/common';
import {
    Tully_Group,
    Prisma,
    prisma,
} from '@prisma/client'
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { parseAsync } from 'json2csv';
import { TullyGroupFields } from 'src/v1 code/tully-group-resolvers/dto/tully-group.dto';



// This is the tully-group-resolvers service file. All the logic for querying for group data from the tully catalog (from the postgres database) is written here.
// Since we use prisma to access our database, we need to import the necessary imports first. These include the Tully_Group model itself from the
// prisma client, along with the prisma client itself and the prisma Service. This file will be imported into the tully-group-resolvers module, under the imports
// array.

//We will inject TullyGroupService into the required files that need it (the controller, which will handle the HTTP requests for tully-groups)
@Injectable()
export class TullyGroupService {
    //inject the prisma service here


    constructor(private prisma: PrismaService) {}





    //This is the logic for finding a SINGLE galaxy based on an arbitrary "where" argument.
    //INPUTS: Of the form {field: value}.
    //EXAMPLE USAGE: Any time a repository would want to query the form of SELECT * FROM Tully_Group WHERE { field: value }
    //RETURNS: A SINGLE galaxy, the first that satisfies the where result (best used for searching by ID)
    async tully_group(groupWhereUniqueInput: Prisma.Tully_GroupWhereUniqueInput): Promise<Tully_Group | null> {
        return this.prisma.tully_Group.findUnique({
            where: groupWhereUniqueInput,
        });
    }

    //This is the logic for finding MULTIPLE galaxies based on many arguments
    //RESOURCES:
    //general logic and structure https://docs.nestjs.com/recipes/prisma

    //allowing users to select the fields they want https://github.com/prisma/prisma/issues/3372#issuecomment-685978933


    // async tully_groups<S extends Prisma.Tully_GroupSelect>(
    //     params: {
    //     skip?: number;
    //     take?: number;
    //     cursor?: Prisma.Tully_GroupWhereUniqueInput;
    //     where?: Prisma.Tully_GroupWhereInput;
    //     orderBy?: Prisma.Tully_GroupOrderByInput;
    // },
    // select?: Prisma.Subset<S, Prisma.Tully_GroupSelect>,
    // ) {
    //     //BEFORE: ' : Promise<Tully_Group[]> ' was in between ) {
    //     //function starts here
    //     //deconstruct the params object
    //     //skip, take, cursor, where, orderBy are all parameters the repository can query with?
    //     const { skip, take, cursor, where, orderBy } = params;
    //     return this.prisma.tully_Group.findMany<
    //     { select : S } & Omit<Prisma.Tully_GroupFindManyArgs, 'select' | 'include'>
    //     >({
    //         skip: skip,
    //         take: take,
    //         cursor: cursor,
    //         where: where,
    //         orderBy: orderBy,
    //         select
    //     });
    // } //end of galaxies

    async tully_groups(
        params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.Tully_GroupWhereUniqueInput;
        where?: Prisma.Tully_GroupWhereInput;
        orderBy?: Prisma.Tully_GroupOrderByInput;
    },
    select?: any,
    )//: Promise<Tully_Group[] | null>
    {
        //BEFORE: ' : Promise<Tully_Group[]> ' was in between ) {
        //function starts here
        //deconstruct the params object
        //skip, take, cursor, where, orderBy are all parameters the repository can query with?
        const { skip, take, cursor, where, orderBy } = params;
        const select0 = makeTully_GroupSelect(select)
        return this.prisma.tully_Group.findMany({
            skip: skip,
            take: take,
            cursor: cursor,
            where: where,
            orderBy: orderBy,
            select: select0,
            // {
            //     nest: selectHelp("nest", select),
            //     num_members: selectHelp("num_members", select),
            //     pcg_name: selectHelp("pcg_name", select),
            //     sg_lon: selectHelp("sg_lon", select),
            //     sg_lat: selectHelp("sg_lat", select),
            //     log_lk: selectHelp("log_lk", select),
            //     v_mod: selectHelp("v_mod", select),
            //     dist_mod: selectHelp("dist_mod", select),
            //     sig_v: selectHelp("sig_v", select),
            //     r2t: selectHelp("r2t", select),
            //     sigmap: selectHelp("sigmap", select),
            //     mass: selectHelp("mass", select),
            //     cf: selectHelp("cf", select),
            // }
        });
    } //end of galaxies

    //simply returns all tully_groups
    async all_tully_groups(): Promise<Tully_Group[] | null> {

        return this.prisma.tully_Group.findMany();
    }

    async customQuery(fields: string, query: string): Promise<Tully_Group[] | null> {
        console.log(`SELECT ${fields} FROM universe."Tully_Group" ${query}`)
        // const result = await this.prisma.$queryRaw`SELECT ${fields} FROM universe."Tully_Group" ${query}`



        const result = await this.prisma.$queryRaw('SELECT ' + fields + ' FROM universe."Tully_Group" ' + query +';')

        return result;

    }


    async createTullyGroup(data: Prisma.Tully_GroupCreateInput): Promise<Tully_Group> {
        return this.prisma.tully_Group.create({
            data,
        });
    }
}
// function selectHelp2(select: any): Prisma.Tully_GroupSelect {
//     const selectObj: Prisma.Tully_GroupSelect = JSON.parse(select)
//     return selectObj;
// }

// function selectHelp(field: string, select: any): boolean {
//     return select[field] ? select[field] != null : false;
// }

// https://github.com/prisma/prisma/issues/3372
// this was the only way i found how to do this.
function makeTully_GroupSelect<T extends Prisma.Tully_GroupSelect>(
    select: Prisma.Subset<T, Prisma.Tully_GroupSelect>,
): T {
    return select;
}



