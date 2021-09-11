import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { DatabaseLookupService } from '../database-lookup.service';
import { TULLY_ENVIRONMENT_LOOKUP } from '../resource options/resource-constants';
import { TullyEnvironmentOptions } from '../resource options/resource-options.interface';
import { TullyEnvironmentController } from './tully-environment.controller';

const tullyEnvironmentLookupFactory =  {
  provide: TULLY_ENVIRONMENT_LOOKUP,
  useFactory: (prisma: PrismaService) => {
    return new DatabaseLookupService<TullyEnvironmentOptions>(prisma, prisma.tully_Environment, 'universe."Tully_Environment"')
  },
  inject: [PrismaService],
}



@Module({
  imports: [PrismaModule],
  controllers: [TullyEnvironmentController],
  providers: [tullyEnvironmentLookupFactory]
})
export class TullyEnvironmentModule {}
