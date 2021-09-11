
import { ApiProperty } from '@nestjs/swagger';
import { ThresholdOptions } from 'src/resources/resource options/resource-globals';


export enum TullyEnvironmentFields {


orig_src_name = 'orig_src_name',
hisrc_name = 'hisrc_name',
agcnr = 'agcnr',
name = 'name',
radeg_hi = 'radeg_hi',
decdeg_hi = 'decdeg_hi',
radeg_oc = 'radeg_oc',
decdeg_oc = 'decdeg_oc',
radeg_use = 'radeg_use',
decdeg_use = 'decdeg_use',
vhelio = 'vhelio',
errv = 'errv',
w50 = 'w50',
err_wtot = 'err_wtot',
err_wstat = 'err_wstat',
w20 = 'w20',
hiflux = 'hiflux',
errflux = 'errflux',
snr = 'snr',
rms = 'rms',
dist = 'dist',
log_msun = 'log_msun',
hicode = 'hicode',
phot_code = 'phot_code',
agc = 'agc',
objid = 'objid',
parentid = 'parentid',
spec_objid = 'spec_objid',
ra = 'ra',
dec = 'dec',
model_mag_u = 'model_mag_u',
model_mag_g = 'model_mag_g',
model_mag_r = 'model_mag_r',
model_mag_i = 'model_mag_i',
model_mag_z = 'model_mag_z',
model_mag_err_u = 'model_mag_err_u',
model_mag_err_g = 'model_mag_err_g',
model_mag_err_r = 'model_mag_err_r',
model_mag_err_i = 'model_mag_err_i',
model_mag_err_z = 'model_mag_err_z',
c_model_mag_u = 'c_model_mag_u',
c_model_mag_g = 'c_model_mag_g',
c_model_mag_r = 'c_model_mag_r',
c_model_mag_i = 'c_model_mag_i',
c_model_mag_z = 'c_model_mag_z',
c_model_mag_err_u = 'c_model_mag_err_u',
c_model_mag_err_g = 'c_model_mag_err_g',
c_model_mag_err_r = 'c_model_mag_err_r',
c_model_mag_err_i = 'c_model_mag_err_i',
c_model_mag_err_z = 'c_model_mag_err_z',
petro_mag_u = 'petro_mag_u',
petro_mag_g = 'petro_mag_g',
petro_mag_r = 'petro_mag_r',
petro_mag_i = 'petro_mag_i',
petro_mag_z = 'petro_mag_z',
petro_mag_err_u = 'petro_mag_err_u',
petro_mag_err_g = 'petro_mag_err_g',
petro_mag_err_r = 'petro_mag_err_r',
petro_mag_err_i = 'petro_mag_err_i',
petro_mag_err_z = 'petro_mag_err_z',
petro_rad_u = 'petro_rad_u',
petro_rad_g = 'petro_rad_g',
petro_rad_r = 'petro_rad_r',
petro_rad_i = 'petro_rad_i',
petro_rad_z = 'petro_rad_z',
petror50_g = 'petror50_g',
petror50_r = 'petror50_r',
petror50_i = 'petror50_i',
petror90_g = 'petror90_g',
petror90_r = 'petror90_r',
petror90_i = 'petror90_i',
extinction_u = 'extinction_u',
extinction_g = 'extinction_g',
extinction_r = 'extinction_r',
extinction_i = 'extinction_i',
extinction_z = 'extinction_z',
expab_g = 'expab_g',
expab_r = 'expab_r',
expab_i = 'expab_i',
exp_mag_g = 'exp_mag_g',
exp_mag_r = 'exp_mag_r',
exp_mag_i = 'exp_mag_i',
flags_u = 'flags_u',
flags_g = 'flags_g',
flags_r = 'flags_r',
flags_i = 'flags_i',
flags_z = 'flags_z',
flags = 'flags',
lnlexp_r = 'lnlexp_r',
lnldev_r = 'lnldev_r',
type = 'type',
frac_dev_g = 'frac_dev_g',
frac_dev_r = 'frac_dev_r',
frac_dev_i = 'frac_dev_i',
exp_rad_g = 'exp_rad_g',
exp_rad_r = 'exp_rad_r',
exp_rad_i = 'exp_rad_i',
skydistdeg2 = 'skydistdeg2',
skdistarcsec = 'skdistarcsec',
ocfromsdssarcseconds = 'ocfromsdssarcseconds',

}

export class Tully_Environment_DTO {

@ApiProperty()
orig_src_name: number;
@ApiProperty()
hisrc_name: number;
@ApiProperty()
agcnr: number;
@ApiProperty()
name: number;
@ApiProperty()
radeg_hi: number;
@ApiProperty()
decdeg_hi: number;
@ApiProperty()
radeg_oc: number;
@ApiProperty()
decdeg_oc: number;
@ApiProperty()
radeg_use: number;
@ApiProperty()
decdeg_use: number;
@ApiProperty()
vhelio: number;
@ApiProperty()
errv: number;
@ApiProperty()
w50: number;
@ApiProperty()
err_wtot: number;
@ApiProperty()
err_wstat: number;
@ApiProperty()
w20: number;
@ApiProperty()
hiflux: number;
@ApiProperty()
errflux: number;
@ApiProperty()
snr: number;
@ApiProperty()
rms: number;
@ApiProperty()
dist: number;
@ApiProperty()
log_msun: number;
@ApiProperty()
hicode: number;
@ApiProperty()
phot_code: number;
@ApiProperty()
agc: number;
@ApiProperty()
objid: number;
@ApiProperty()
parentid: number;
@ApiProperty()
spec_objid: number;
@ApiProperty()
ra: number;
@ApiProperty()
dec: number;
@ApiProperty()
model_mag_u: number;
@ApiProperty()
model_mag_g: number;
@ApiProperty()
model_mag_r: number;
@ApiProperty()
model_mag_i: number;
@ApiProperty()
model_mag_z: number;
@ApiProperty()
model_mag_err_u: number;
@ApiProperty()
model_mag_err_g: number;
@ApiProperty()
model_mag_err_r: number;
@ApiProperty()
model_mag_err_i: number;
@ApiProperty()
model_mag_err_z: number;
@ApiProperty()
c_model_mag_u: number;
@ApiProperty()
c_model_mag_g: number;
@ApiProperty()
c_model_mag_r: number;
@ApiProperty()
c_model_mag_i: number;
@ApiProperty()
c_model_mag_z: number;
@ApiProperty()
c_model_mag_err_u: number;
@ApiProperty()
c_model_mag_err_g: number;
@ApiProperty()
c_model_mag_err_r: number;
@ApiProperty()
c_model_mag_err_i: number;
@ApiProperty()
c_model_mag_err_z: number;
@ApiProperty()
petro_mag_u: number;
@ApiProperty()
petro_mag_g: number;
@ApiProperty()
petro_mag_r: number;
@ApiProperty()
petro_mag_i: number;
@ApiProperty()
petro_mag_z: number;
@ApiProperty()
petro_mag_err_u: number;
@ApiProperty()
petro_mag_err_g: number;
@ApiProperty()
petro_mag_err_r: number;
@ApiProperty()
petro_mag_err_i: number;
@ApiProperty()
petro_mag_err_z: number;
@ApiProperty()
petro_rad_u: number;
@ApiProperty()
petro_rad_g: number;
@ApiProperty()
petro_rad_r: number;
@ApiProperty()
petro_rad_i: number;
@ApiProperty()
petro_rad_z: number;
@ApiProperty()
petror50_g: number;
@ApiProperty()
petror50_r: number;
@ApiProperty()
petror50_i: number;
@ApiProperty()
petror90_g: number;
@ApiProperty()
petror90_r: number;
@ApiProperty()
petror90_i: number;
@ApiProperty()
extinction_u: number;
@ApiProperty()
extinction_g: number;
@ApiProperty()
extinction_r: number;
@ApiProperty()
extinction_i: number;
@ApiProperty()
extinction_z: number;
@ApiProperty()
expab_g: number;
@ApiProperty()
expab_r: number;
@ApiProperty()
expab_i: number;
@ApiProperty()
exp_mag_g: number;
@ApiProperty()
exp_mag_r: number;
@ApiProperty()
exp_mag_i: number;
@ApiProperty()
flags_u: number;
@ApiProperty()
flags_g: number;
@ApiProperty()
flags_r: number;
@ApiProperty()
flags_i: number;
@ApiProperty()
flags_z: number;
@ApiProperty()
flags: number;
@ApiProperty()
lnlexp_r: number;
@ApiProperty()
lnldev_r: number;
@ApiProperty()
type: number;
@ApiProperty()
frac_dev_g: number;
@ApiProperty()
frac_dev_r: number;
@ApiProperty()
frac_dev_i: number;
@ApiProperty()
exp_rad_g: number;
@ApiProperty()
exp_rad_r: number;
@ApiProperty()
exp_rad_i: number;
@ApiProperty()
skydistdeg2: number;
@ApiProperty()
skdistarcsec: number;
@ApiProperty()
ocfromsdssarcseconds: number;

}

export class Tully_Environment_QueryParamDTO {

    @ApiProperty({
      enum: TullyEnvironmentFields,
      enumName: 'Target Tully Environment Field',
      isArray: false,
       
    })
    tullyEnvironmentField: TullyEnvironmentFields; //this is the field to apply the filter to 
  
    @ApiProperty({
      enum: ThresholdOptions,
      enumName: 'Target Tully Environment Threshold',
      isArray: false,
      
    })
    tullyEnvironmentCondition: ThresholdOptions; //can be one of the conditional statments
  
    @ApiProperty({
      enum: TullyEnvironmentFields,
      enumName: 'Tully Environment Fields to Return',
      isArray: true,
    })
    //include: Prisma.Tully_GroupSelect; 
    tullyEnvironmentInclude: TullyEnvironmentFields;
  
  }
  
  export class Tully_Environment_FieldSelectDTO {
    @ApiProperty({
      enum: TullyEnvironmentFields,
      enumName: 'Tully Environment Fields Sql Return',
      isArray: true 
    })
    tullyEnvironmentFields: TullyEnvironmentFields;
  }
