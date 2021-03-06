import { HttpStatus, Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request } from "express";
import { CustomException } from "../../../errors/custom.exception";
import { ResourceBusinessErrors } from "../errors/resource.error";
import { ResourceValidation } from "../validation/resource.validation";


/**
 * @middleware Checks the existence of a valid resource within the request body.
 * If the resource is invalid, throws an exception. Otherwise, appends the found
 * resource object to the request object to be used later.
 */
@Injectable()
export class ResourceExistsMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ResourceExistsMiddleware.name)
  constructor(
    private readonly resourceValidation: ResourceValidation
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    this.logger.log("RESOURCE MIDDLEWARE EXECUTED");

    if(!req.body.resourceName) {
      throw new CustomException(
        ResourceBusinessErrors.ResourceNotFound,
        "No resource was supplied with the request body",
        HttpStatus.BAD_REQUEST
      );
    }
    // validateResourceExistence throws exception for us
    req.resource = await this.resourceValidation.validateResourceExistence(req.body.resourceName);

    next();
  }

}
