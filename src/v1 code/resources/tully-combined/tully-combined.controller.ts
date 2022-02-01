import { Tully_Combined } from '.prisma/client';
import { Controller, Get, Inject, Param, ParseFloatPipe, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { DatabaseLookupService } from '../database-lookup.service';
import { TULLY_COMBINED_LOOKUP } from '../resource options/resource-constants';
import { TullyCombinedOptions } from '../resource options/resource-options.interface';
import { parseAsync } from 'json2csv';
import { Tully_Combined_FieldSelectDTO, Tully_Combined_QueryParamDTO } from './dto/tully-combined.dto';
import { generateSearchJSON } from '../resource options/resource-globals';

@Controller('tully-combined')
export class TullyCombinedController {
  constructor(@Inject(TULLY_COMBINED_LOOKUP) private readonly db: DatabaseLookupService<TullyCombinedOptions>) {}

  //----------------------------------------------------------------------------------------------------

  // @UseGuards(JwtAuthGuard)
  @ApiTags('Tully Combined') //displays the 'catagory' that this endpoint falls under
  @ApiOperation({summary: "Returns the entire datasheet for 'Tully Combined', including galaxy and group data"})
  @ApiOkResponse({
      description: 'returns all groups from the tully combined catalog\nWARNING: browser can take up to 15 seconds to load response body'
  })
  @ApiUnauthorizedResponse({
      description: 'this endpoint requires signing in. If you do not have an account, contact us to make one //TODO rewrite'
  })
  // @ApiBearerAuth()
  //@ApiBody({type: Tully_Group_DTO}) //as of 8/25/2021, swagger does not work well with Prisma. Prisma automatically creates our DTO's for us,
  //but makes them as TYPES, not CLASSES. SwaggerUI cannot handle types, so we have to rewrite our DTO ourselves in tully-group-resolvers.dto, and tell
  //swagger to display the information for that instead.
  @Get()
  async getAllTullyCombined(): Promise<Tully_Combined[]> {
      const payload = await this.db.returnAll();
      return parseAsync(payload)
  }

  //----------------------------------------------------------------------------------------------------

      //This is the logic for returning optical properties based on a certain threshold, defined by the query keyword WHERE

      @ApiTags('Tully Combined')
      // @UseGuards(JwtAuthGuard)
      @ApiOperation({summary: "Custom query: Specify a CONDITION, a THRESHOLD, and a TARGET -- Along with an array of fields you want returned"})
      // @ApiBearerAuth()
      @ApiOkResponse({description: "Queried data returned successfuly"})
      @ApiQuery({name: 'tullyCombinedCondition', type: Tully_Combined_QueryParamDTO, required: true })
      @ApiParam({name: 'tullyCombinedThreshold', schema: {type: "number"}, description: "numerical threshold to return by"})
      @Get('tully-combined-filter/:tullyCombinedThreshold')
      async getTullyCombinedByQuery(@Query() dto: Tully_Combined_QueryParamDTO, @Param('tullyCombinedThreshold', new ParseFloatPipe()) threshold: number): Promise<Tully_Combined[]> {

        const where = `{"${dto.tullyCombinedField}": { "${dto.tullyCombinedCondition}": ${(threshold)} }}`

        const search = generateSearchJSON(dto.tullyCombinedInclude)

        const payload = await this.db.returnMultipleByQuery({
          where: JSON.parse(where),
        }, search)

        return parseAsync(payload)

      }

      //--------------------------------------------------------------------------------------------------


    @ApiTags('Tully Combined')
    // @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: "allows for a custom SQL query -- Select an array of fields to return"})
    // @ApiBearerAuth()
    @ApiOkResponse({ description : "data queried successfuly"})
    @ApiQuery({name: 'tullyCombinedFields', type: Tully_Combined_FieldSelectDTO})
    @ApiParam({name: "sql", schema: {type: "string"} ,description: "Sql code to be placed after SELECT {your fields} FROM Tully_Combined ..."})
    @Get('tully-combined-custom/:sql')
    async getTullyGroupsWithSql(@Query() dto: Tully_Combined_FieldSelectDTO, @Param('sql') sql: string): Promise<Tully_Combined[]> {

        const payload = await this.db.customQuery(dto.tullyCombinedFields.toString(), sql)
        return parseAsync(payload)
    }



}
