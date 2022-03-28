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
import { DataModelRouteNames } from "./constants/data-model-route-names";
import { ResourceExistsMiddleware } from "./middleware/resource-exists.middleware";


@Module({
    imports: [PrismaModule, RepositoryModule],
    controllers: [DataModelController, ResourceController],
    providers: [ResourceService, DataModelService],
})
export class ResourceModule implements NestModule {
    configure(consumer: MiddlewareConsumer): any {
        consumer
          .apply(UserMiddleware)
          .forRoutes(DataModelRouteNames.BASE_NAME)
          .apply(RepositoryExistsMiddleware)
          .forRoutes(
            DataModelRouteNames.BASE_NAME+DataModelRouteNames.PUBLISH_DATA_MODEL,
            DataModelRouteNames.BASE_NAME+DataModelRouteNames.UPDATE_DATA_MODEL,
            DataModelRouteNames.BASE_NAME+DataModelRouteNames.UPDATE_DATA_MODEL_REPOSITORIES,
            DataModelRouteNames.BASE_NAME+DataModelRouteNames.UPDATE_DATA_MODEL_COLUMN_NAMES,
            DataModelRouteNames.BASE_NAME+DataModelRouteNames.DELETE_DATA_MODEL,
            )
          .apply(ResourceExistsMiddleware)
          .forRoutes(
            DataModelRouteNames.BASE_NAME+DataModelRouteNames.UPDATE_DATA_MODEL_COLUMN_NAMES,
            DataModelRouteNames.BASE_NAME+DataModelRouteNames.DELETE_DATA_MODEL,
            DataModelRouteNames.BASE_NAME+DataModelRouteNames.UPDATE_DATA_MODEL,
            DataModelRouteNames.BASE_NAME+DataModelRouteNames.UPDATE_DATA_MODEL_REPOSITORIES

          )
    }
}
