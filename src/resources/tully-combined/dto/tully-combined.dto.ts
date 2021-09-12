import { ApiProperty } from "@nestjs/swagger";
import { ThresholdOptions } from "src/resources/resource options/resource-globals";

export enum TullyCombinedFields {
    pgc = 'pgc',
gal_glon = 'gal_glon',
gal_glat = 'gal_glat',
gal_sglon = 'gal_sglon',
gal_sglat = 'gal_sglat',
morph = 'morph',
vhelio = 'vhelio',
v_ls = 'v_ls',
vmod = 'vmod',
j_h = 'j_h',
j_k = 'j_k',
k_mag = 'k_mag',
log_lk = 'log_lk',
log_rhok = 'log_rhok',
nest = 'nest',
num_members = 'num_members',
brightest_pcg = 'brightest_pcg',
dis = 'dis',
dm = 'dm',
group_sglon = 'group_sglon',
group_sglat = 'group_sglat',
log_lkg = 'log_lkg',
cf = 'cf',
sigmap = 'sigmap',
r2t = 'r2t',
gal_v_mod = 'gal_v_mod',
vbw = 'vbw',
vbw_err = 'vbw_err',
sigma_vbw = 'sigma_vbw',
v_rms = 'v_rms',
rbw = 'rbw',
rbw_err = 'rbw_err',
m12vir = 'm12vir',
m12lum = 'm12lum',
hdc = 'hdc',
ldc = 'ldc',
twomplusplus = 'twomplusplus',
group_sgx = 'group_sgx',
group_sgy = 'group_sgy',
group_sgz = 'group_sgz',
}

export class Tully_Combined_DTO {

@ApiProperty()
pgc: number;
@ApiProperty()
gal_glon: number;
@ApiProperty()
gal_glat: number;
@ApiProperty()
gal_sglon: number;
@ApiProperty()
gal_sglat: number;
@ApiProperty()
morph: number;
@ApiProperty()
vhelio: number;
@ApiProperty()
v_ls: number;
@ApiProperty()
vmod: number;
@ApiProperty()
j_h: number;
@ApiProperty()
j_k: number;
@ApiProperty()
k_mag: number;
@ApiProperty()
log_lk: number;
@ApiProperty()
log_rhok: number;
@ApiProperty()
nest: number;
@ApiProperty()
num_members: number;
@ApiProperty()
brightest_pcg: number;
@ApiProperty()
dis: number;
@ApiProperty()
dm: number;
@ApiProperty()
group_sglon: number;
@ApiProperty()
group_sglat: number;
@ApiProperty()
log_lkg: number;
@ApiProperty()
cf: number;
@ApiProperty()
sigmap: number;
@ApiProperty()
r2t: number;
@ApiProperty()
gal_v_mod: number;
@ApiProperty()
vbw: number;
@ApiProperty()
vbw_err: number;
@ApiProperty()
sigma_vbw: number;
@ApiProperty()
v_rms: number;
@ApiProperty()
rbw: number;
@ApiProperty()
rbw_err: number;
@ApiProperty()
m12vir: number;
@ApiProperty()
m12lum: number;
@ApiProperty()
hdc: number;
@ApiProperty()
ldc: number;
@ApiProperty()
twomplusplus: number;
@ApiProperty()
group_sgx: number;
@ApiProperty()
group_sgy: number;
@ApiProperty()
group_sgz: number;

}


export class Tully_Combined_QueryParamDTO {

    @ApiProperty({
      enum: TullyCombinedFields,
      enumName: 'Target Tully Combined Field',
      isArray: false,
       
    })
    tullyCombinedField: TullyCombinedFields; //this is the field to apply the filter to 
  
    @ApiProperty({
      enum: ThresholdOptions,
      enumName: 'Target Tully Combined Threshold',
      isArray: false,
      
    })
    tullyCombinedCondition: ThresholdOptions; //can be one of the conditional statments
  
    @ApiProperty({
      enum: TullyCombinedFields,
      enumName: 'Tully Combined fields to Return',
      isArray: true,
    })
    //include: Prisma.Tully_GroupSelect; 
    tullyCombinedInclude: TullyCombinedFields;
  
  }
  
  export class Tully_Combined_FieldSelectDTO {
    @ApiProperty({
      enum: TullyCombinedFields,
      enumName: 'Tully Combined Fields Sql Return',
      isArray: true 
    })
    tullyCombinedFields: TullyCombinedFields;
  }
