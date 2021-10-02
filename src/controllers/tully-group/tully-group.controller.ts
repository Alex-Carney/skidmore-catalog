import { Controller, Get, Param, ParseEnumPipe, ParseFloatPipe, ParseIntPipe, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiProduces, ApiQuery, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Tully_Group as Tully_Group_Model } from '@prisma/client';
import { TullyGroupService } from 'src/services/tully-group.service';
import { FieldSelectDTO, QueryParamDTO, TullyGroupFields, } from 'src/resolvers/tully-group/dto/tully-group.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { LocationUpload } from 'src/models/inputs/location-upload.input';
// import { MyModel } from 'src/models/my.model';
import { parseAsync, parse } from 'json2csv';

//this controller handles HTTP requests for tully-group data

//TODO: Move ApiTags up here (and auth?)

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('tully-group')
export class TullyGroupController {
    //inject the tully-group service class, which holds the actual logic for querying from the database 
    constructor(private readonly tullyGroupService: TullyGroupService) {}


    //-------------------------------------------------------------------------------------------------------------------------------------

    //This is the logic for returning ALL tully groups -- the entire CSV stored on the database. While all the business logic (actually fetching)
    //the data from the postgresql) is done in the tully-groups.service.ts file, we still need to define an endpoint here. Additionally, the 
    //slew of decorators (@) tell SwaggerUI how to populate our frontend UI to make it easier for people to consume our data. 

    @UseGuards(JwtAuthGuard)
    @ApiTags('Tully Catalog') //displays the 'catagory' that this endpoint falls under
    @ApiOperation({summary: "returns all the data from the tully group list"})
    @ApiOkResponse({
        description: 'returns all groups from the tully catalog\nWARNING: browser can take up to 15 seconds to load response body'
    })
    @ApiUnauthorizedResponse({
        description: 'this endpoint requires signing in. If you do not have an account, contact us to make one //TODO rewrite'
    })
    @ApiBearerAuth()
    //@ApiBody({type: Tully_Group_DTO}) //as of 8/25/2021, swagger does not work well with Prisma. Prisma automatically creates our DTO's for us,
    //but makes them as TYPES, not CLASSES. SwaggerUI cannot handle types, so we have to rewrite our DTO ourselves in tully-group.dto, and tell
    //swagger to display the information for that instead. 
    @Get()
    async getAllTullyGroups(): Promise<Tully_Group_Model[]> {
        const payload = await this.tullyGroupService.all_tully_groups();
        return parseAsync(payload)
    }

//-------------------------------------------------------------------------------------------------------------------------------------------------

//-----------------------------------------------------------------------------------------------------------------------------
    //This is the logic for returning a single groups, based on what is effectively a UUID

    @ApiTags('Tully Catalog')
    @ApiOperation({summary: "returns a single group based on its nest number"})
    @ApiOkResponse({
        description: 'returns a single group from the tully catalog, according to its nest # (effectively its UUID)',
    })
    //@ApiBody({type: Tully_Group_DTO})
    //ANYONE CAN USE THIS ROUTE 
    @Get('/:nestID')
    async getTullyGroupByNest(@Param('nestID', new ParseIntPipe()) nest: number): Promise<Tully_Group_Model> {
        //in the galaxies service, we simply defined a template for fetching galaxies from the database. In fact, the only parameter
        //the READ function takes is a "where: input" option. So, whatever we pass as the parameter of this line of code will be read
        //by the galaxy function, and execute where: (INPUT)

        const payload = await this.tullyGroupService.tully_group({nest:nest})
        return parseAsync(payload)
        //return this.tullyGroupService.tully_group({nest: nest});

    }
//-------------------------------------------------------------------------------------------------------------------------------------------------


    @ApiTags('Tully Catalog')
    @ApiOkResponse({
        description: 'upload a file of celestial locations'
    })
    @ApiBody({
        description: 'List of celestial locations',
        type: LocationUpload
    })
    @ApiOperation({summary: "search by location - upload a file with celestial coordinates"})
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file')) //takes two arguments: fieldName which is the HTML field holding the file 
    //(default: 'file') and MulterOptions
    @Post('filter/location')
    async searchByLocation(@UploadedFile() file: Express.Multer.File) {
        const buf = file.buffer
        console.log(buf.toString());
    }




//-------------------------------------------------------------------------------------------------------------------------------------------------

    //This is the logic for returning groups based on a certain threshold, defined by the query keyword WHERE

    @ApiTags('Tully Catalog')
    // @ApiProduces("application/json", "text/csv")
    @ApiOkResponse({
        description: 'returns a list of groups from the tully catalog, according to a defined threshold. This threshold \n can be based on greater than, less than, or equal to, and can be applied to any of the fields'
    })
    @ApiOperation({summary: "Returns list of groups based on a condition applied to a field. Return fields are optional as well"})
    // @ApiCreatedResponse({
    //     type: MyModel
    // })
    //@ApiBody({type: Tully_Group_DTO})
    @ApiQuery({ name: 'conditional', type: QueryParamDTO})
    @Get('filter/:threshold')
    async getTullyGroupsByThreshold(@Query() dto: QueryParamDTO, @Param('threshold', new ParseFloatPipe()) threshold: number): Promise<Tully_Group_Model[]> {
        const whereInput = `{"${dto.field}": { "${dto.conditional}": ${(threshold)} }}`
        const jsonSearch = {}
        
        //This code is a mess, but solves 2 complicated problems.
        //For one, Prisma has an issue where "select" arguments are not easy to integrate with OpenAPI, and cannot be transferred between
        //files. Therefore, we have to iteravely create an object for our select parameter that we will use in the tully_group service.
        //Also, for some reason, openAPI is supposed to return an Array of TullyGroupFields. However, when only 1 field is selected, 
        //a string is returned instead of an array of strings. Therefore, we need an additional check of logic to make sure the spread operator
        //does not just make a bunch of characters 
        const includeArray = Array(...dto.include);
        (includeArray[0].length == 1 ? Array(dto.include) : includeArray).forEach((col) => {jsonSearch[col] = true}) 
        //Array(...dto.include).forEach((col) => {jsonSearch[col] = true}) //OLD VER
    

        const payload = await this.tullyGroupService.tully_groups({
            where: JSON.parse(whereInput),//accept the URI as a string, convert to json for the 'where' input from prisma ORM          
        }, jsonSearch)
        return parseAsync(payload)
    }

//--------------------------------------------------------------------------------------------------------------------

    @ApiTags('Tully Catalog')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: "allows for a custom SQL query"})
    @ApiBearerAuth()
    @ApiOkResponse({ description : "yes"})
    @ApiQuery({name: 'fields', type: FieldSelectDTO})
    @ApiParam({name: "sql", schema: {type: "string"} ,description: "Sql code to be placed after SELECT {your fields} FROM Tully_Group ..."})
    @Get('custom/:sql')
    async getTullyGroupsWithSql(@Query() dto: FieldSelectDTO, @Param('sql') sql: string): Promise<Tully_Group_Model[]> {
        
        console.log(dto.fields.toString());
        console.log(sql);
        
        const payload = await this.tullyGroupService.customQuery(dto.fields.toString(), sql)
        return parseAsync(payload)
    }



}
