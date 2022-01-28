import { Module } from "@nestjs/common";
import { ResourceController } from "src/controllers/resource.controller";
import { PrismaModule } from "src/prisma/prisma.module";
import { ResourceService } from "src/services/resource.service";
import { UserModule } from "../user/user.module";
import { DataModelController } from "../../controllers/data-model.controller";
import { DataModelService } from "../../services/data-model.service";

@Module({
    imports: [PrismaModule, UserModule],
    controllers: [DataModelController, ResourceController],
    providers: [ResourceService, DataModelService],
})
export class ResourceModule {}
