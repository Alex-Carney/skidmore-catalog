import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { ResourceValidation } from "../validation/resource.validation";
/**
 * This guard can be used to decorate controller routes with
 * @UseGuards(ResourcePermissionGuard)
 */
@Injectable()
export class ResourceAccessAuthGuard implements CanActivate {
  private readonly logger = new Logger(ResourceAccessAuthGuard.name)
  constructor(private reflector: Reflector, private resourceValidation: ResourceValidation) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    this.logger.log("RESOURCE AUTH GUARD EXECUTED")
    const request = context.switchToHttp().getRequest();
    /*
    Because of the middleware applied before this guard, the request object
    should have these fields attached to it by this point
     */
    this.logger.log(request.repository)
    this.logger.log(request.resource)
    return this.resourceValidation.validateResourceAccessFromRepository(request.repository.title, request.resource.title)
  }
}
