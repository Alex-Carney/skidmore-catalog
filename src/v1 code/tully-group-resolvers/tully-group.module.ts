import { Module } from '@nestjs/common';
import { TullyGroupController } from 'src/v1 code/tully-group/tully-group.controller';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { TullyGroupService } from 'src/v1 code/tully-group.service';

@Module({
    imports: [PrismaModule],
    controllers: [TullyGroupController],
    providers: [TullyGroupService]
    //doesn't need exports -- we don't need to query for galaxies anywhere else (and if we did, we could probably query our own API)
})




export class TullyGroupModule {}
