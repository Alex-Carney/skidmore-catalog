import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { ResourceValidation } from "../validation/resource.validation";
/**
 * This guard can be used to decorate controller routes with
 * @UseGuards(ResourcePermissionGuard)
 */
@Injectable()
export class ResourceAccessAuthGuard implements CanActivate {
  constructor(private reflector: Reflector, private resourceValidation: ResourceValidation) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    console.log("RESOURCE AUTH GUARD EXECUTED")
    const request = context.switchToHttp().getRequest();
    console.log(request.repository)
    console.log(request.resource)
    return this.resourceValidation.validateResourceAccessFromRepository(request.repository.title, request.resource.title)
  }
}
