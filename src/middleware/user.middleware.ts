import { Injectable, NestMiddleware } from "@nestjs/common";
import { UserService } from "../modules/account/services/user.service";
import { NextFunction, Request } from "express";
import { User } from "@prisma/client";

export interface RequestWithUserData extends Request {
  user: User
}

/**
 * Solves the problem of calling 'const repository = await this.userService.getUserFromRequest(req);' from every single
 * controller method inside of RepositoryController.
 */
@Injectable()
export class UserMiddleware implements NestMiddleware {
  constructor(
    private readonly userService: UserService
  ) {
  }

  async use(req: Request, res: Response, next: NextFunction) {
    console.log("USER MIDDLEWARE EXECUTED");
    await this.userService.getUserFromRequest(req).then((user) => {
      req.user = user;
    });
    next();
  }


}
