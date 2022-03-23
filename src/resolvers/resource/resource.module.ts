import { Module } from "@nestjs/common";
import { ResourceController } from "src/controllers/resource.controller";
import { PrismaModule } from "src/prisma/prisma.module";
import { ResourceService } from "src/services/resource.service";
import { RepositoryModule } from "../../modules/repository/repository.module";
import { DataModelController } from "../../controllers/data-model.controller";
import { DataModelService } from "../../services/data-model.service";
import { AuthModule } from "../auth/auth.module";
import { AuthService } from "../../services/auth.service";

@Module({
    imports: [PrismaModule, RepositoryModule],
    controllers: [DataModelController, ResourceController],
    providers: [ResourceService, DataModelService],
})
export class ResourceModule {}
