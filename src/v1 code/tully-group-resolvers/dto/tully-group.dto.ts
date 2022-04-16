// THIS IS NOT USEFUL AND WILL BE DELETED

//as of 8/25/2021, swagger does not work well with Prisma. Prisma automatically creates our DTO's for us,
//but makes them as TYPES, not CLASSES. SwaggerUI cannot handle types, so we have to rewrite our DTO ourselves in tully-group-resolvers.dto, and tell
//swagger to display the information for that instead.

//if this bug/issue is fixed, then this file will be completely useless and can be safely deleted. However, the @ApiBody tags in the controllers
//will have to be updated accordingly

import { ApiProperty } from '@nestjs/swagger';

import {
  Tully_Group,
  Prisma,
} from '@prisma/client'
import { UniqueEnumValueNamesRule } from 'graphql';

export enum ThresholdOptions {
  GreaterThan = 'gt',
  GreaterThanOrEqualTo = 'gte',
  LessThan = 'lt',
  LessThanOrEqualTo = 'lte',
  EqualTo = 'equals',
  NotEqualTo = 'not',
}

export enum TullyGroupFields {

  nest = 'nest',
  num_members = 'num_members',
  pcg_name = 'pcg_name',
  sg_lon = 'sg_lon',
  sg_lat = 'sg_lat',
  log_lk = 'log_lk',
  v_mod = 'v_mod',
  dist_mod = 'dist_mod',
  sig_v = 'sig_v',
  r2t = 'r2t',
  sigmap = 'sigmap',
  mass = 'mass',
  cf = 'cf',

}


export enum TullyGroupFields2 {

  nest = 'nest',
  num_members = 'num_members',
  pcg_name = 'pcg_name',
  sg_lon = 'sg_lon',
  sg_lat = 'sg_lat',
  log_lk = 'log_lk',
  v_mod = 'v_mod',
  dist_mod = 'dist_mod',
  sig_v = 'sig_v',
  r2t = 'r2t',
  sigmap = 'sigmap',
  mass = 'mass',
  cf = 'cf',

}

export class Tully_Group_DTO {

  @ApiProperty()
  nest:         number;
  @ApiProperty()
  num_members:  number;
  @ApiProperty()
  pcg_name:     string;
  @ApiProperty()
  sg_lon:       string;
  @ApiProperty()
  sg_lat:       number;
  @ApiProperty()
  log_lk:       number;
  @ApiProperty()
  v_mod:        number;
  @ApiProperty()
  dist_mod:     number;
  @ApiProperty()
  sig_v:        number;
  @ApiProperty()
  r2t:          number;
  @ApiProperty()
  sigmap:       number;
  @ApiProperty()
  mass:         string;
  @ApiProperty()
  cf:           number;

}

export class QueryParamDTO {


  @ApiProperty({
    enum: TullyGroupFields,
    enumName: 'Target Field',
    isArray: false
  })
  field: TullyGroupFields; //this is the field to apply the filter to

  // // @IsNumber()
  // //@IsOptional()
  // @Type(() => Number)
  // @Transform(({ value }) => Number(value))
  // threshold: number; //has to be a string because mass values are far above the maximum int value

  @ApiProperty({
    enum: ThresholdOptions,
    enumName: 'Threshold Options',
    isArray: false
  })
  conditional: ThresholdOptions; //can be one of the conditional statments

  @ApiProperty({
    enum: TullyGroupFields,
    enumName: 'Fields to return',
    isArray: true
  })
  //include: Prisma.Tully_GroupSelect;
  include: TullyGroupFields;

}

export class FieldSelectDTO {
  @ApiProperty({
    enum: TullyGroupFields2,
    enumName: 'return these fields',
    isArray: true
  })
  fields: TullyGroupFields2;
}


