import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ResourceService } from "../services/resource.service";
import { Observable } from "rxjs";
/**
 * This guard can be used to decorate controller routes with
 * @UseGuards(ResourcePermissionGuard) and @Re
 */
@Injectable()
export class ResourceAuthGuard implements CanActivate {
  constructor(private reflector: Reflector, private resourceService: ResourceService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    console.log("RESOURCE AUTH GUARD EXECUTED")
    const request = context.switchToHttp().getRequest();
    console.log(request.repository)
    console.log(request.resource)
    return this.resourceService.validateResourceAccessFromRepository(request.repository.title, request.resource.title)
  }
}
