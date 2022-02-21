import { SetMetadata } from "@nestjs/common";

export const RepositoryPermissionLevel = (permissionLevel: number) => SetMetadata('permissionLevel', permissionLevel)
