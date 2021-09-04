import { Module } from '@nestjs/common';
import { TullyGroupController } from 'src/controllers/tully-group/tully-group.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TullyGroupService } from 'src/services/tully-group.service';

@Module({
    imports: [PrismaModule],
    controllers: [TullyGroupController],
    providers: [TullyGroupService]
    //doesn't need exports -- we don't need to query for galaxies anywhere else (and if we did, we could probably query our own API)
})




export class TullyGroupModule {}
