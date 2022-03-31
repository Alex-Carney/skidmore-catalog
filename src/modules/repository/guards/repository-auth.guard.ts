import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/services/prisma.service";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { RepositoryValidation } from "../validation/repository.validation";

/**
 * This guard can be used to decorate controller routes with
 * @UseGuards(RepositoryPermissionGuard) and @RepositoryPermissionLevel(level)
 * which allows validation that a user is a high enough permission of a repository
 * to occur before the route is handled.
 *
 * NOTE: Requires that the user object is attached to the request, requires
 * User middleware to fire first.
 *
 * Also requires repository object to be attached to the request, required validate
 * repository existence middleware to fire first
 */
@Injectable()
export class RepositoryPermissionGuard implements CanActivate {
  constructor(private reflector: Reflector, private repositoryValidation: RepositoryValidation) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    console.log("REPOSITORY AUTH GUARD EXECUTED")
    const requiredLevel = this.reflector.get<number>('permissionLevel', context.getHandler())
    console.log(requiredLevel)
    if(!requiredLevel) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    return this.repositoryValidation.authenticateUserRequest(request.user['id'], request.repository.title, requiredLevel);
  }
}
