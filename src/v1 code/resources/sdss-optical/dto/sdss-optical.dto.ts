// THIS IS NOT USEFUL AND WILL BE DELETED

//as of 8/25/2021, swagger does not work well with Prisma. Prisma automatically creates our DTO's for us,
//but makes them as TYPES, not CLASSES. SwaggerUI cannot handle types, so we have to rewrite our DTO ourselves in tully-group-resolvers.dto, and tell
//swagger to display the information for that instead.

//if this bug/issue is fixed, then this file will be completely useless and can be safely deleted. However, the @ApiBody tags in the controllers
//will have to be updated accordingly

import { ApiProperty } from '@nestjs/swagger';

//now defined in resource-globals.ts
export enum ThresholdOptions2 {
  GreaterThan = 'gt',
  GreaterThanOrEqualTo = 'gte',
  LessThan = 'lt',
  LessThanOrEqualTo = 'lte',
  EqualTo = 'equals',
  NotEqualTo = 'not',
}

export enum SdssOpticalFields {

    agc = 'agc',
    sdss_phot_flag = 'sdss_phot_flag',
    sdss_objid = 'sdss_objid',
    ra = 'ra',
    dec = 'dec',
    vhelio = 'vhelio',
    dist = 'dist',
    sig_dist = 'sig_dist',
    extinction_g = 'extinction_g',
    extinction_i = 'extinction_i',
    exp_ab_r = 'exp_ab_r',
    exp_ab_r_err = 'exp_ab_r_err',
    c_model_mag_i = 'c_model_mag_i',
    c_model_mag_err_i = 'c_model_mag_err_i',



}


export class Sdss_OpticalPropertiesDTO {

    @ApiProperty()
    agc:            number;
    @ApiProperty()
    sdss_phot_flag:   number;
    @ApiProperty()
    sdss_objid:     string;
    @ApiProperty()
    ra:             number;
    @ApiProperty()
    dec:            number;
    @ApiProperty()
    vhelio:         number;
    @ApiProperty()
    dist:           number;
    @ApiProperty()
    sig_dist:        number;
    @ApiProperty()
    extinction_g:   number;
    @ApiProperty()
    extinction_i:   number;
    @ApiProperty()
    exp_ab_r:        number;
    @ApiProperty()
    exp_ab_r_err:    number;
    @ApiProperty()
    c_model_mag_i:    number;
    @ApiProperty()
    c_model_mag_err_i: number;



}

export class Sdss_Optical_QueryParamDTO {

  @ApiProperty({
    enum: SdssOpticalFields,
    enumName: 'Target Sdss Optical Field',
    isArray: false,

  })
  sdssOpticalField: SdssOpticalFields; //this is the field to apply the filter to

  @ApiProperty({
    enum: ThresholdOptions2,
    enumName: 'Target Sdss Optical Threshold',
    isArray: false,

  })
  sdssOpticalCondition: ThresholdOptions2; //can be one of the conditional statments

  @ApiProperty({
    enum: SdssOpticalFields,
    enumName: 'Sdss Optical Fields to Return',
    isArray: true,
  })
  //include: Prisma.Tully_GroupSelect;
  sdssOpticalInclude: SdssOpticalFields;

}

export class Sdss_Optical_FieldSelectDTO {
  @ApiProperty({
    enum: SdssOpticalFields,
    enumName: 'Sdss Optical Fields Sql Return',
    isArray: true
  })
 sdssOpticalFields: SdssOpticalFields;
}


