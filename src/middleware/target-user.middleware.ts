import { HttpStatus, Injectable, NestMiddleware } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { NextFunction } from "express";
import { Request } from "express";
import { User } from "@prisma/client";
import { CustomException } from "../errors/custom.exception";
import { UserBusinessErrors } from "../errors/user.error";

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
    console.log("TARGET USER MIDDLEWARE EXECUTED")
    if(!req.body.receiverEmail) {
      throw new CustomException(UserBusinessErrors.UserNotFound,
        "No email was supplied with the request body",
        HttpStatus.BAD_REQUEST)
    }
    await this.userService.getUserFromEmail(req.body.receiverEmail).then((user) => {
      req.target_user = user;
    });
    next();
  }


}
