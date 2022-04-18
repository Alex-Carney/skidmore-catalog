import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common";
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
  private readonly logger = new Logger(RepositoryPermissionGuard.name);
  constructor(private reflector: Reflector, private repositoryValidation: RepositoryValidation) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    console.log("REPOSITORY AUTH GUARD EXECUTED")

    const requiredLevel = this.reflector.get<number>('permissionLevel', context.getHandler())
    console.log(requiredLevel)
    if(!requiredLevel) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    this.logger.log("Repository auth guard executed on user " + request.user['id'] + " on repo " + request.repository.title + " against required level " + requiredLevel)
    return this.repositoryValidation.authenticateUserRequest(request.user['id'], request.repository.title, requiredLevel);
  }
}
