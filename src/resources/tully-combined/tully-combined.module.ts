import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { DatabaseLookupService } from '../database-lookup.service';
import { TULLY_COMBINED_LOOKUP } from '../resource options/resource-constants';
import { TullyCombinedOptions } from '../resource options/resource-options.interface';
import { TullyCombinedController } from './tully-combined.controller';

const tullyCombinedLookupFactory = {
  provide: TULLY_COMBINED_LOOKUP,
  useFactory: (prisma: PrismaService) => {
    return new DatabaseLookupService<TullyCombinedOptions>(prisma, prisma.tully_Combined, 'universe."Tully_Combined"')
  },
  inject: [PrismaService],
}


@Module({
  imports: [PrismaModule],
  controllers: [TullyCombinedController],
  providers: [tullyCombinedLookupFactory]
})
export class TullyCombinedModule {}
