import { Controller, Get, Inject, Param, ParseFloatPipe, Query, UseGuards } from '@nestjs/common';
import { Injectable } from '@nestjs/common/interfaces';
import { ApiTags, ApiOperation, ApiOkResponse, ApiUnauthorizedResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { DatabaseLookupService } from '../database-lookup.service';
import { SDSS_OPTICAL_LOOKUP } from '../resource options/resource-constants';
import { SdssOpticalOptions } from '../resource options/resource-options.interface';
import { parseAsync } from 'json2csv';
import { SDSS_OpticalProperties } from '@prisma/client';
import { QueryParamDTO } from 'src/resolvers/tully-group/dto/tully-group.dto';

@Controller('sdss-optical')
export class SdssOpticalController {
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
  //but makes them as TYPES, not CLASSES. SwaggerUI cannot handle types, so we have to rewrite our DTO ourselves in tully-group.dto, and tell
  //swagger to display the information for that instead. 
  @Get()
  async getAllTullyGroups(): Promise<SDSS_OpticalProperties[]> {
      const payload = await this.db.returnAll();
      return parseAsync(payload)
  }

  //----------------------------------------------------------------------------------------------------

      //This is the logic for returning groups based on a certain threshold, defined by the query keyword WHERE

      @ApiTags('SDSS Optical')
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
      async getTullyGroupsByThreshold(@Query() dto: QueryParamDTO, @Param('threshold', new ParseFloatPipe()) threshold: number): Promise<SDSS_OpticalProperties[]> {
          const whereInput = `{"${dto.field}": { "${dto.conditional}": ${(threshold)} }}`
          const jsonSearch = {}
          const includeArray = Array(...dto.include);
          (includeArray[0].length == 1 ? Array(dto.include) : includeArray).forEach((col) => {jsonSearch[col] = true}) 
          //Array(...dto.include).forEach((col) => {jsonSearch[col] = true}) //OLD VER
      
  
          const payload = await this.db.returnMultipleByQuery({
              where: JSON.parse(whereInput),//accept the URI as a string, convert to json for the 'where' input from prisma ORM          
          }, jsonSearch)
          return parseAsync(payload)
      }



}
