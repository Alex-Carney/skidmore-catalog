import { PrismaModule } from "../../prisma/prisma.module";
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { UserService } from '../../services/user.service';
import { PasswordService } from '../../services/password.service';
import { RepositoryController } from 'src/controllers/repository.controller';
import { AuthModule } from '../auth/auth.module';
import { RepositoryService } from 'src/services/repository.service';
import { UserMiddleware } from "../../middleware/user.middleware";
import { RepositoryExistsMiddleware } from "../../middleware/repository-exists.middleware";
import { RepositoryValidation } from "../../validation/repository.validation";
//import { RoleModule } from '../role/role.module';

@Module({
  imports: [PrismaModule, AuthModule, /**RoleModule**/],
  controllers: [RepositoryController],
  providers: [UserService, PasswordService, RepositoryService, RepositoryValidation],
  exports: [UserService, RepositoryService],
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
