import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { RepositoryValidation } from "../validation/repository.validation";

@Injectable()
export class RepositoryPermissionGuard implements CanActivate {
  constructor(private reflector: Reflector, private repositoryValidation: RepositoryValidation) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    console.log("REPOSITORY AUTH GUARD EXECUTED")
    const requiredLevel = this.reflector.get<number>('permissionLevel', context.getHandler())
    if(!requiredLevel) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    return this.repositoryValidation.authenticateUserRequest(request.user['id'], request.repository.title, requiredLevel);
  }
}
