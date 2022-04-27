import { PrismaModule } from "../prisma/prisma.module";
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { UserService } from '../account/services/user.service';
import { PasswordService } from '../authentication/services/password.service';
import { RepositoryController } from 'src/modules/repository/controllers/repository.controller';
import { AuthModule } from '../authentication/auth.module';
import { RepositoryService } from 'src/modules/repository/services/repository.service';
import { UserMiddleware } from "../../middleware/user.middleware";
// import { RepositoryExistsMiddleware } from "../../middleware/repository-exists.middleware";
import { RepositoryValidation } from "./validation/repository.validation";
// import { RepositoryExistsRule } from "./validation/repository-exists.rule";
import { RepositoryExistsMiddleware } from "./middleware/repository-exists.middleware";
//import { RoleModule } from '../role/role.module';

@Module({
  imports: [PrismaModule, AuthModule, /**RoleModule**/],
  controllers: [RepositoryController],
  providers: [UserService, PasswordService, /**RepositoryExistsRule**/ RepositoryService, RepositoryValidation],
  exports: [UserService, RepositoryService, /**RepositoryExistsRule**/ RepositoryValidation],
})
export class RepositoryModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(UserMiddleware)
      .forRoutes('repository')
      .apply(RepositoryExistsMiddleware)
      .forRoutes('repository/update-permissions', 'repository/delete-repositories')
  }
}
