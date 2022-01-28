import { Controller, Get, Inject, Param, ParseFloatPipe, Query, UseGuards } from '@nestjs/common';
import { Injectable } from '@nestjs/common/interfaces';
import { ApiTags, ApiOperation, ApiOkResponse, ApiUnauthorizedResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { DatabaseLookupService } from '../database-lookup.service';
import { SDSS_OPTICAL_LOOKUP } from '../resource options/resource-constants';
import { SdssOpticalOptions } from '../resource options/resource-options.interface';
import { parseAsync } from 'json2csv';
import { SDSS_OpticalProperties } from '@prisma/client';
import { Sdss_Optical_FieldSelectDTO, Sdss_Optical_QueryParamDTO } from './dto/sdss-optical.dto';

@Controller('sdss-optical')
export class SdssOpticalController {

  //Since we have a custom provider, we have slightly different Dependency Injection syntax
  constructor(@Inject(SDSS_OPTICAL_LOOKUP) private readonly db: DatabaseLookupService<SdssOpticalOptions>) {}


  //----------------------------------------------------------------------------------------------------

  // @UseGuards(JwtAuthGuard)
  @ApiTags('SDSS Optical') //displays the 'catagory' that this endpoint falls under
  @ApiOperation({summary: "returns all the data from the tully group list"})
  @ApiOkResponse({
      description: 'returns all groups from the tully catalog\nWARNING: browser can take up to 15 seconds to load response body'
  })
  @ApiUnauthorizedResponse({
      description: 'this endpoint requires signing in. If you do not have an account, contact us to make one //TODO rewrite'
  })
  // @ApiBearerAuth()
  //@ApiBody({type: Tully_Group_DTO}) //as of 8/25/2021, swagger does not work well with Prisma. Prisma automatically creates our DTO's for us,
  //but makes them as TYPES, not CLASSES. SwaggerUI cannot handle types, so we have to rewrite our DTO ourselves in tully-group-resolvers.dto, and tell
  //swagger to display the information for that instead.
  @Get()
  async getAllSdssOpticalProperties(): Promise<SDSS_OpticalProperties[]> {
      const payload = await this.db.returnAll();
      return parseAsync(payload)
  }

  //----------------------------------------------------------------------------------------------------

      //This is the logic for returning optical properties based on a certain threshold, defined by the query keyword WHERE

      @ApiTags('SDSS Optical')
      // @UseGuards(JwtAuthGuard)
      @ApiOperation({summary: "Allows for a custom query"})
      // @ApiBearerAuth()
      @ApiOkResponse({description: "yes"})
      @ApiQuery({name: 'sdssOpticalCondition', type: Sdss_Optical_QueryParamDTO, required: true })
      @ApiParam({name: 'sdss_opticalThreshold', schema: {type: "number"}, description: "numerical threshold to return by"})
      @Get('sdss-filter/:sdss_opticalThreshold')
      async getSdssOpticalPropertiesByQuery(@Query() dto: Sdss_Optical_QueryParamDTO, @Param('sdss_opticalThreshold', new ParseFloatPipe()) threshold: number): Promise<SDSS_OpticalProperties[]> {

        const where = `{"${dto.sdssOpticalField}": { "${dto.sdssOpticalCondition}": ${(threshold)} }}`
        const search = {}
        const includeArray = Array(...dto.sdssOpticalInclude);
        (includeArray[0].length == 1 ? Array(dto.sdssOpticalInclude) : includeArray).forEach((col) => {search[col] = true})

        const payload = await this.db.returnMultipleByQuery({
          where: JSON.parse(where),
        }, search)

        return parseAsync(payload)

      }

      //--------------------------------------------------------------------------------------------------


    @ApiTags('SDSS Optical')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: "allows for a custom SQL query"})
    @ApiBearerAuth()
    @ApiOkResponse({ description : "yes"})
    @ApiQuery({name: 'sdssOpticalFields', type: Sdss_Optical_FieldSelectDTO})
    @ApiParam({name: "sql", schema: {type: "string"} ,description: "Sql code to be placed after SELECT {your fields} FROM SDSS_Optical_Properties ..."})
    @Get('sdss-custom/:sql')
    async getTullyGroupsWithSql(@Query() dto: Sdss_Optical_FieldSelectDTO, @Param('sql') sql: string): Promise<SDSS_OpticalProperties[]> {

        console.log(dto.sdssOpticalFields.toString());
        console.log(sql);

        const payload = await this.db.customQuery(dto.sdssOpticalFields.toString(), sql)
        return parseAsync(payload)
    }




}
