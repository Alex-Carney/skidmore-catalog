import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ResourceController } from "src/modules/resource/controllers/resource.controller";
import { PrismaModule } from "src/modules/prisma/prisma.module";
import { ResourceService } from "src/modules/resource/services/resource.service";
import { RepositoryModule } from "../repository/repository.module";
import { DataModelController } from "./controllers/data-model.controller";
import { DataModelService } from "./services/data-model.service";
import { UserMiddleware } from "../../middleware/user.middleware";
import { RepositoryExistsMiddleware } from "../repository/middleware/repository-exists.middleware";
import { DataModelRouteNames } from "./constants/data-model-route-names";
import { ResourceExistsMiddleware } from "./middleware/resource-exists.middleware";
import { ResourceValidation } from "./validation/resource.validation";
import { ResourceRouteNames } from "./constants/resource-route-names";
import { ConfigModule } from "@nestjs/config";


@Module({
  imports: [PrismaModule, RepositoryModule, ConfigModule],
  controllers: [DataModelController, ResourceController],
  providers: [ResourceService, DataModelService, ResourceValidation]
})
export class ResourceModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(UserMiddleware)
      .forRoutes(DataModelRouteNames.BASE_NAME,
        ResourceRouteNames.BASE_NAME)
      .apply(RepositoryExistsMiddleware)
      .forRoutes(
        DataModelRouteNames.BASE_NAME + DataModelRouteNames.PUBLISH_DATA_MODEL,
        DataModelRouteNames.BASE_NAME + DataModelRouteNames.UPDATE_DATA_MODEL,
        DataModelRouteNames.BASE_NAME + DataModelRouteNames.UPDATE_DATA_MODEL_REPOSITORIES,
        DataModelRouteNames.BASE_NAME + DataModelRouteNames.UPDATE_DATA_MODEL_COLUMN_NAMES,
        DataModelRouteNames.BASE_NAME + DataModelRouteNames.DELETE_DATA_MODEL,
        ResourceRouteNames.BASE_NAME + ResourceRouteNames.QUERY_DATABASE,
      )
      .apply(ResourceExistsMiddleware)
      .forRoutes(
        DataModelRouteNames.BASE_NAME + DataModelRouteNames.UPDATE_DATA_MODEL_COLUMN_NAMES,
        DataModelRouteNames.BASE_NAME + DataModelRouteNames.DELETE_DATA_MODEL,
        DataModelRouteNames.BASE_NAME + DataModelRouteNames.UPDATE_DATA_MODEL,
        DataModelRouteNames.BASE_NAME + DataModelRouteNames.UPDATE_DATA_MODEL_REPOSITORIES,
        ResourceRouteNames.BASE_NAME + ResourceRouteNames.QUERY_DATABASE,
      );
  }
}
