import { SDSS_DerivedProperties } from '.prisma/client';
import { Controller, Get, Inject, Param, ParseFloatPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { DatabaseLookupService } from '../database-lookup.service';
import { SDSS_DERIVED_LOOKUP } from '../resource options/resource-constants';
import { SdssDerivedOptions } from '../resource options/resource-options.interface';
import { parseAsync } from "json2csv"
import { generateSearchJSON } from '../resource options/resource-globals';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Sdss_Derived_FieldSelectDTO, Sdss_Derived_QueryParamDTO } from './dto/sdss-derived.dto';

const tag = 'SDSS Derived'

@Controller('sdss-derived')
export class SdssDerivedController {
    //Since we have a custom provider, we have slightly different Dependency Injection syntax 
    constructor(@Inject(SDSS_DERIVED_LOOKUP) private readonly db: DatabaseLookupService<SdssDerivedOptions>) {}

    //----------------------------------------------------------------------------------------------------
  
    // @UseGuards(JwtAuthGuard)
    @ApiTags(tag) //displays the 'catagory' that this endpoint falls under
    @ApiOperation({summary: "returns all data from the SDSS Durbala Derived properties table"})
    @ApiOkResponse({
        description: 'returns all groups from the tully catalog\nWARNING: browser can take up to 15 seconds to load response body'
    })
    @ApiUnauthorizedResponse({
        description: 'this endpoint requires signing in. If you do not have an account, contact us to make one //TODO rewrite'
    })
    // @ApiBearerAuth() 
    @Get()
    async getAllSdssDerivedProperties(): Promise<SDSS_DerivedProperties[]> {
        const payload = await this.db.returnAll();
        return parseAsync(payload)
    }
  
    //----------------------------------------------------------------------------------------------------
  
        //This is the logic for returning optical properties based on a certain threshold, defined by the query keyword WHERE
  
        @ApiTags(tag)
        // @UseGuards(JwtAuthGuard)
        @ApiOperation({summary: "Allows for a custom query"})
        // @ApiBearerAuth()
        @ApiOkResponse({description: "yes"})
        @ApiQuery({name: 'sdssDerivedCondition', type: Sdss_Derived_QueryParamDTO, required: true })
        @ApiParam({name: 'sdss_derivedThreshold', schema: {type: "number"}, description: "numerical threshold to return by"})
        @Get('sdss-derived-filter/:sdss_derivedThreshold')
        async getSdssDerivedPropertiesByQuery(@Query() dto: Sdss_Derived_QueryParamDTO, @Param('sdss_derivedThreshold', new ParseFloatPipe()) threshold: number): Promise<SDSS_DerivedProperties[]> {
  
          const where = `{"${dto.sdssDerivedField}": { "${dto.sdssDerivedCondition}": ${(threshold)} }}`
          const search = generateSearchJSON(dto.sdssDerivedInclude)
  
          const payload = await this.db.returnMultipleByQuery({
            where: JSON.parse(where), 
          }, search)
  
          return parseAsync(payload)     
          
        }
  
        //--------------------------------------------------------------------------------------------------
  
        
      @ApiTags(tag)
      @UseGuards(JwtAuthGuard)
      @ApiOperation({summary: "allows for a custom SQL query"})
      @ApiBearerAuth()
      @ApiOkResponse({ description : "yes"})
      @ApiQuery({name: 'sdssDerivedFields', type: Sdss_Derived_FieldSelectDTO})
      @ApiParam({name: "sql", schema: {type: "string"} ,description: "Sql code to be placed after SELECT {your fields} FROM SDSS_Optical_Properties ..."})
      @Get('sdss-derived-custom/:sql')
      async getSdssDerivedPropertiesWithSql(@Query() dto: Sdss_Derived_FieldSelectDTO, @Param('sql') sql: string): Promise<SDSS_DerivedProperties[]> {
          
          const payload = await this.db.customQuery(dto.sdssDerivedFields.toString(), sql)
          return parseAsync(payload)
      }
      
  
  
  
}
