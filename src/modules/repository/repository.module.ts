import { PrismaModule } from "../prisma/prisma.module";
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { UserService } from '../account/services/user.service';
import { PasswordService } from '../authentication/services/password.service';
import { AuthModule } from '../authentication/auth.module';
import { UserMiddleware } from "../../middleware/user.middleware";
import { RepositoryValidation } from "./validation/repository.validation";
import { RepositoryExistsMiddleware } from "./middleware/repository-exists.middleware";
import { RepositoryRouteNames } from "./constants/repository-route-names";
import { RepositoryController } from "./controllers/repository.controller";
import { RepositoryService } from "./services/repository.service";

/**
 * Packages all subsystems of the repository module into an export/importable module
 * @see module.info.txt for more information
 * @author Alex Carney
 */
@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [RepositoryController],
  providers: [UserService, PasswordService, RepositoryService, RepositoryValidation],
  exports: [UserService, RepositoryService, RepositoryValidation],
})
export class RepositoryModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(UserMiddleware)
      .forRoutes(RepositoryRouteNames.BASE_NAME)
      .apply(RepositoryExistsMiddleware)
      .forRoutes(RepositoryRouteNames.BASE_NAME + RepositoryRouteNames.UPDATE_PERMISSIONS,
        RepositoryRouteNames.BASE_NAME + RepositoryRouteNames.DELETE_REPOSITORY)
  }
}
