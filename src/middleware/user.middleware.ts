import { HttpStatus, Injectable, NestMiddleware } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { NextFunction } from "express";
import { Request } from "express";
import { User } from "@prisma/client";
import { UserBusinessErrors } from "../errors/user.error";
import { CustomException } from "../errors/custom.exception";

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
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    console.log("USER MIDDLEWARE EXECUTED")
    await this.userService.getUserFromRequest(req).then((user) => {
      req.user = user;
    });
    next();
  }


}
