import { HttpStatus, Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request } from "express";
import { CustomException } from "../../../errors/custom.exception";
import { ResourceBusinessErrors } from "../../../errors/resource.error";
import { Resource } from "@prisma/client"
import { ResourceValidation } from "../validation/resource.validation";


/**
 * @middleware Checks the existence of a valid resource within the request body.
 * If the resource is invalid, throws an exception. Otherwise, appends the found
 * resource object to the request object to be used later.
 */
@Injectable()
export class ResourceExistsMiddleware implements NestMiddleware {
  constructor(
    private readonly resourceValidation: ResourceValidation
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    console.log("RESOURCE MIDDLEWARE EXECUTED");

    if(!req.body.resourceName) {
      throw new CustomException(
        ResourceBusinessErrors.ResourceNotFound,
        "No resource was supplied with the request body",
        HttpStatus.BAD_REQUEST
      );
    }
    // validateResourceExistence throws exception for us
    const resource: Resource = await this.resourceValidation.validateResourceExistence(req.body.resourceName)
    req.resource = resource;

    next();
  }

}
