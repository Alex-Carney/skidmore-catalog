/** Interface for providing configurable options to all feature services. Instead of writing static providers for each feature,
 *  there is a single resource-options file that dynamically generates providers implementing a base model.
 *  Each resource hosted by the API will have its provider options defined here 
 * */

import { Prisma, SDSS_OpticalProperties } from ".prisma/client";
import { Type } from "@nestjs/common";


export interface ResourceOptions {
    ReturnType: any,
    WhereUniqueType: any,
    WhereType: any,
    OrderByType: any,
    SelectType: any,
    
}

export interface SdssOpticalOptions {
    ReturnType: SDSS_OpticalProperties,
    WhereUniqueType: Prisma.SDSS_OpticalPropertiesWhereUniqueInput
    WhereType: Prisma.SDSS_OpticalPropertiesWhereInput
    OrderByType: Prisma.SDSS_OpticalPropertiesOrderByInput
    SelectType: Prisma.SDSS_OpticalPropertiesSelect

}

