import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ResourceController } from "src/modules/resource/controllers/resource.controller";
import { PrismaModule } from "src/prisma/prisma.module";
import { ResourceService } from "src/modules/resource/services/resource.service";
import { RepositoryModule } from "../repository/repository.module";
import { DataModelController } from "./controllers/data-model.controller";
import { DataModelService } from "./services/data-model.service";
import { AuthModule } from "../../resolvers/auth/auth.module";
import { AuthService } from "../../services/auth.service";
import { UserMiddleware } from "../../middleware/user.middleware";
import { RepositoryExistsMiddleware } from "../repository/middleware/repository-exists.middleware";
import { RepositoryExistsRule } from "../repository/validation/repository-exists.rule";

@Module({
    imports: [PrismaModule, RepositoryModule],
    controllers: [DataModelController, ResourceController],
    providers: [ResourceService, DataModelService],
})
export class ResourceModule implements NestModule {
    configure(consumer: MiddlewareConsumer): any {
        consumer
          .apply(UserMiddleware)
          .forRoutes('data-model')
          .apply(RepositoryExistsMiddleware)
          .forRoutes('data-model/publish-data-model')
    }
}
