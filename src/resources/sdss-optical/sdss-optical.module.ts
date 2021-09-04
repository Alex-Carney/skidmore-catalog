import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { DatabaseLookupService } from '../database-lookup.service';
import { SDSS_OPTICAL_LOOKUP } from '../resource options/resource-constants';
import { SdssOpticalOptions } from '../resource options/resource-options.interface';
import { SdssOpticalController } from './sdss-optical.controller';


const sdssOpticalLookupFactory = {
  provide: SDSS_OPTICAL_LOOKUP,
  useFactory: (prisma: PrismaService) => {
    return new DatabaseLookupService<SdssOpticalOptions>(prisma, prisma.sDSS_OpticalProperties)
  },
  inject: [PrismaService],

}



@Module({
  imports: [PrismaModule],
  controllers: [SdssOpticalController],
  providers: [sdssOpticalLookupFactory]
})
export class SdssOpticalModule {}
