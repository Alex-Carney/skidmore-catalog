import { Controller, Get, Inject, Param, ParseFloatPipe, Query, UseGuards } from '@nestjs/common';
import { DatabaseLookupService } from '../database-lookup.service';
import { TULLY_ENVIRONMENT_LOOKUP } from '../resource options/resource-constants';
import { TullyEnvironmentOptions } from '../resource options/resource-options.interface';
import { parseAsync } from "json2csv"
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Tully_Environment } from '.prisma/client';
import { Tully_Environment_FieldSelectDTO, Tully_Environment_QueryParamDTO } from './dto/tully-environment.dto';
import { generateSearchJSON } from '../resource options/resource-globals';

const tag = "Tully Environment"

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('tully-environment')
export class TullyEnvironmentController {
  constructor(@Inject(TULLY_ENVIRONMENT_LOOKUP) private readonly db: DatabaseLookupService<TullyEnvironmentOptions>) {}

  //----------------------------------------------------------------------------------------------------

  // @UseGuards(JwtAuthGuard)
  @ApiTags(tag) //displays the 'catagory' that this endpoint falls under
  @ApiOperation({summary: "returns all the data from the tully environment list"})
  @ApiOkResponse({
      description: 'returns all groups from the tully environment catalog\nWARNING: browser can take up to 15 seconds to load response body'
  })
  @ApiUnauthorizedResponse({
      description: 'this endpoint requires signing in. If you do not have an account, contact us to make one //TODO rewrite'
  })
  // @ApiBearerAuth()
  //@ApiBody({type: Tully_Group_DTO}) //as of 8/25/2021, swagger does not work well with Prisma. Prisma automatically creates our DTO's for us,
  //but makes them as TYPES, not CLASSES. SwaggerUI cannot handle types, so we have to rewrite our DTO ourselves in tully-group-resolvers.dto, and tell
  //swagger to display the information for that instead.
  @Get()
  async getAllTullyEnvironment(): Promise<Tully_Environment[]> {

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
      @ApiQuery({name: 'tullyEnvironmentCondition', type: Tully_Environment_QueryParamDTO, required: true })
      @ApiParam({name: 'tullyEnvironmentThreshold', schema: {type: "number"}, description: "numerical threshold to return by"})
      @Get('tully-env-filter/:tullyEnvironmentThreshold')
      async getTullyEnvironmentByQuery(@Query() dto: Tully_Environment_QueryParamDTO, @Param('tullyEnvironmentThreshold', new ParseFloatPipe()) threshold: number): Promise<Tully_Environment[]> {

        const where = `{"${dto.tullyEnvironmentField}": { "${dto.tullyEnvironmentCondition}": ${(threshold)} }}`
        // const search = {}
        // const includeArray = Array(...dto.sdssOpticalInclude);
        // (includeArray[0].length == 1 ? Array(dto.sdssOpticalInclude) : includeArray).forEach((col) => {search[col] = true})

        const search = generateSearchJSON(dto.tullyEnvironmentInclude)

        const payload = await this.db.returnMultipleByQuery({
          where: JSON.parse(where),
        }, search)

        return parseAsync(payload)

      }

      //--------------------------------------------------------------------------------------------------


    @ApiTags('Tully Environment')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: "allows for a custom SQL query"})
    @ApiBearerAuth()
    @ApiOkResponse({ description : "yes"})
    @ApiQuery({name: 'tullyEnvironmentFields', type: Tully_Environment_FieldSelectDTO})
    @ApiParam({name: "sql", schema: {type: "string"} ,description: "Sql code to be placed after SELECT {your fields} FROM SDSS_Optical_Properties ..."})
    @Get('tully-env-custom/:sql')
    async getTullyEnvironmentWithSql(@Query() dto: Tully_Environment_FieldSelectDTO, @Param('sql') sql: string): Promise<Tully_Environment[]> {

        const payload = await this.db.customQuery(dto.tullyEnvironmentFields.toString(), sql)
        return parseAsync(payload)
    }



}
