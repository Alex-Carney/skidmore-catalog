/** Interface for providing configurable options to all feature services. Instead of writing static providers for each feature,
 *  there is a single resource-options file that dynamically generates providers implementing a base model.
 *  Each resource hosted by the API will have its provider options defined here 
 * */

import { Prisma, SDSS_OpticalProperties, Tully_Combined, Tully_Environment } from ".prisma/client";
import { Type } from "@nestjs/common";
import { SDSS_DerivedProperties } from "@prisma/client";


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

export interface SdssDerivedOptions {
    ReturnType: SDSS_DerivedProperties,
    WhereUniqueType: Prisma.SDSS_DerivedPropertiesWhereUniqueInput
    WhereType: Prisma.SDSS_DerivedPropertiesWhereInput
    OrderByType: Prisma.SDSS_DerivedPropertiesOrderByInput
    SelectType: Prisma.SDSS_DerivedPropertiesSelect
}

export interface TullyEnvironmentOptions {
    ReturnType: Tully_Environment,
    WhereUniqueType: Prisma.Tully_EnvironmentWhereUniqueInput
    WhereType: Prisma.Tully_EnvironmentWhereInput
    OrderByType: Prisma.Tully_EnvironmentOrderByInput
    SelectType: Prisma.Tully_EnvironmentSelect
}

export interface TullyCombinedOptions {
    ReturnType: Tully_Combined,
    WhereUniqueType: Prisma.Tully_CombinedWhereUniqueInput
    WhereType: Prisma.Tully_CombinedWhereInput
    OrderByType: Prisma.Tully_CombinedOrderByInput
    SelectType: Prisma.Tully_CombinedSelect
}

