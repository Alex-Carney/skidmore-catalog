import { BadRequestException, HttpStatus, Injectable, NestMiddleware } from "@nestjs/common";
import { UserService } from "../../../services/user.service";
import { NextFunction } from "express";
import { Request } from "express";
import { Repository, User } from "@prisma/client";
import { RequestWithUserData } from "../../../middleware/user.middleware";
import { RepositoryValidation } from "../validation/repository.validation";
import { CustomException } from "../../../errors/custom.exception";
import { RepositoryBusinessErrors } from "../errors/repository.error";
import { RepositoryService } from "../services/repository.service";

// export interface RequestWithUserData extends Request {
//   repository: User
// }

/**
 * @middleware Checks the existence of a valid repository within the request body. If the repository is invalid,
 * throws an exception. Otherwise, appends the found repository to the request object to be used later.
 *
 *
 */
@Injectable()
export class RepositoryExistsMiddleware implements NestMiddleware {
  constructor(
    private readonly repositoryService: RepositoryService
  ) {
  }

  async use(req: Request, res: Response, next: NextFunction) {

    console.log("REPOSITORY MIDDLEWARE EXECUTED")

    if (!req.body.repository) {
      throw new CustomException(RepositoryBusinessErrors.RepositoryNotFound,
        "No repository was supplied in the request body",
        HttpStatus.BAD_REQUEST);
    }

    let repository: Repository;
    try {
      repository = await this.repositoryService.getRepositoryByName(req.body.repository);
    } catch(e) {
      throw new BadRequestException()
    }

    if (!repository) {
      throw new CustomException(RepositoryBusinessErrors.RepositoryNotFound,
        req.body.repository + " was an invalid repository title",
        HttpStatus.NOT_FOUND);
    }

    req.repository = repository

    next();
  }


}
