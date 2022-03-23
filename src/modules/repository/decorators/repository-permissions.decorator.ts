import { SetMetadata } from "@nestjs/common";

// For use with repository-auth.guard.ts. Allows a decorator that blocks requests on a controller route when the
// permission level of that repository is too low.
export const RepositoryPermissionLevel = (permissionLevel: number) => SetMetadata('permissionLevel', permissionLevel)
