import { ApiProperty } from "@nestjs/swagger";
import { ThresholdOptions } from "src/resources/resource options/resource-globals";

export enum SdssDerivedFields {
agc = 'agc',
gamma_g = 'gamma_g',
gamma_i = 'gamma_i',
abs_mag_i_corr = 'abs_mag_i_corr',
abs_mag_i_corr_err = 'abs_mag_i_corr_err',
gmi_corr = 'gmi_corr',
gmi_corr_err = 'gmi_corr_err',
log_mstar_taylor = 'log_mstar_taylor',
log_mstar_taylor_err = 'log_mstar_taylor_err',
log_mstar_mc_gaugh = 'log_mstar_mc_gaugh',
log_mstar_mc_gaugh_err = 'log_mstar_mc_gaugh_err',
log_mstargswlc = 'log_mstargswlc',
log_mstargswlc_err = 'log_mstargswlc_err',
logsfr22 = 'logsfr22',
logsfr22_err = 'logsfr22_err',
logsfrnuvir = 'logsfrnuvir',
logsfrnuvir_err = 'logsfrnuvir_err',
logsfrgswlc = 'logsfrgswlc',
logsfrgswlc_err = 'logsfrgswlc_err',
logmh = 'logmh',
logmh_err = 'logmh_err',
}

export class SDSS_DerivedPropertiesDTO {
@ApiProperty()
agc: number;
@ApiProperty()
gamma_g: number;
@ApiProperty()
gamma_i: number;
@ApiProperty()
abs_mag_i_corr: number;
@ApiProperty()
abs_mag_i_corr_err: number;
@ApiProperty()
gmi_corr: number;
@ApiProperty()
gmi_corr_err: number;
@ApiProperty()
log_mstar_taylor: number;
@ApiProperty()
log_mstar_taylor_err: number;
@ApiProperty()
log_mstar_mc_gaugh: number;
@ApiProperty()
log_mstar_mc_gaugh_err: number;
@ApiProperty()
log_mstargswlc: number;
@ApiProperty()
log_mstargswlc_err: number;
@ApiProperty()
logsfr22: number;
@ApiProperty()
logsfr22_err: number;
@ApiProperty()
logsfrnuvir: number;
@ApiProperty()
logsfrnuvir_err: number;
@ApiProperty()
logsfrgswlc: number;
@ApiProperty()
logsfrgswlc_err: number;
@ApiProperty()
logmh: number;
@ApiProperty()
logmh_err: number;  
}

export class Sdss_Derived_QueryParamDTO {

    @ApiProperty({
      enum: SdssDerivedFields,
      enumName: 'Target Sdss Derived Field',
      isArray: false,
       
    })
    sdssDerivedField: SdssDerivedFields; //this is the field to apply the filter to 
  
    @ApiProperty({
      enum: ThresholdOptions,
      enumName: 'Target Sdss Derived Threshold',
      isArray: false,
      
    })
    sdssDerivedCondition: ThresholdOptions; //can be one of the conditional statments
  
    @ApiProperty({
      enum: SdssDerivedFields,
      enumName: 'Sdss Derived Fields to Return',
      isArray: true,
    })
    //include: Prisma.Tully_GroupSelect; 
    sdssDerivedInclude: SdssDerivedFields;
  
  }
  
  export class Sdss_Derived_FieldSelectDTO {
    @ApiProperty({
      enum: SdssDerivedFields,
      enumName: 'Sdss Derived Fields Sql Return',
      isArray: true 
    })
   sdssDerivedFields: SdssDerivedFields;
  }

