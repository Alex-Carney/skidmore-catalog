import { BadRequestException, HttpStatus, Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request } from "express";
import { Repository } from "@prisma/client";
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

  private readonly logger = new Logger(RepositoryExistsMiddleware.name);

  constructor(
    private readonly repositoryService: RepositoryService
  ) {
  }

  async use(req: Request, res: Response, next: NextFunction) {


    if (!req.body.repository) {
      throw new CustomException(RepositoryBusinessErrors.RepositoryNotFound,
        "No repository was supplied in the request body",
        HttpStatus.BAD_REQUEST);
    }

    let repository: Repository;
    try {
      repository = await this.repositoryService.getRepositoryByName(req.body.repository);
    } catch (e) {
      throw new BadRequestException();
    }

    if (!repository) {
      throw new CustomException(RepositoryBusinessErrors.RepositoryNotFound,
        req.body.repository + " was an invalid repository title",
        HttpStatus.NOT_FOUND);
    }

    this.logger.log("Repository exists middleware fired, adding repository " + repository.title + " to request");
    req.repository = repository;

    next();
  }


}
