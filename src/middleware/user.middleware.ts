import { Injectable, NestMiddleware } from "@nestjs/common";
import { UserService } from "../modules/account/services/user.service";
import { NextFunction, Request } from "express";
import { User } from "@prisma/client";
import { Logger } from "@nestjs/common";

export interface RequestWithUserData extends Request {
  user: User
}

@Injectable()
export class UserMiddleware implements NestMiddleware {
  /**
   * Solves the problem of calling 'const repository = await this.userService.getUserFromRequest(req);' from every
   * single controller method inside of module controllers. Instead, apply this middleware (inside of the respective module
   * file) to each route that requires a valid user
   * @param userService dependency
   * @author Alex Carney
   */
  constructor(
    private readonly userService: UserService
  ) {
  }

  private readonly logger = new Logger(UserMiddleware.name);

  // Middleware implementation
  async use(req: Request, res: Response, next: NextFunction) {
    this.logger.log("USER MIDDLEWARE EXECUTED");
    await this.userService.getUserFromRequest(req).then((user) => {
      req.user = user;
    });
    next();
  }


}
