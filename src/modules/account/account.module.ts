import { UserController } from "./controllers/user.controller";
import { AuthModule } from "../authentication/auth.module";
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { UserService } from "./services/user.service";
import { PasswordService } from "../authentication/services/password.service";
import { AuthService } from "../authentication/services/auth.service";
import { UserMiddleware } from "../../middleware/user.middleware";
import { AccountRouteNames } from "./constants/account-route-names";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [UserController],
  providers: [UserService, PasswordService, AuthService]
})
export class AccountModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(UserMiddleware)
      .forRoutes(
        AccountRouteNames.BASE_NAME + AccountRouteNames.CHANGE_PASSWORD);
  }

}
