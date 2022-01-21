import { Module } from "@nestjs/common";
import { ResourceController } from "src/controllers/resource.controller";
import { PrismaModule } from "src/prisma/prisma.module";
import { ResourceService } from "src/services/resource.service";
import { UserModule } from "../user/user.module";

@Module({
    imports: [PrismaModule, UserModule],
    controllers: [ResourceController],
    providers: [ResourceService],
})
export class ResourceModule {}