import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { DatabaseLookupService } from '../database-lookup.service';
import { SDSS_DERIVED_LOOKUP } from '../resource options/resource-constants';
import { SdssDerivedOptions } from '../resource options/resource-options.interface';
import { SdssDerivedController } from './sdss-derived.controller';

const sdssDerivedLookupFactory = {
  provide: SDSS_DERIVED_LOOKUP,
  useFactory: (prisma: PrismaService) => {
    return new DatabaseLookupService<SdssDerivedOptions>(prisma, prisma.sDSS_DerivedProperties, 'universe."SDSS_DerivedProperties"')
  },
  inject: [PrismaService],
}


@Module({
  imports: [PrismaModule],
  controllers: [SdssDerivedController],
  providers: [sdssDerivedLookupFactory]
})
export class SdssDerivedModule {}
