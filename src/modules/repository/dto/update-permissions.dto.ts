import { ApiProperty } from "@nestjs/swagger";

//This is the scaffold for the Swagger UI POST body for adding new roles to a repository
export class UpdateRepositoryPermissionsDTO {
    @ApiProperty({
        description: 'title of repository to change permissions for',
    })

    repository: string //title of role == unique identifier

    @ApiProperty({
        description: 'The email address of an existing repository to change the permission level of',
        default: 'username@skidmore.edu'
    })

    receiverEmail: string //email of repository == unique identifier

    @ApiProperty({
        description: 'New permission level of recipient. 0 revokes all access, 1 grants read/write, 2 grants administration, 3 changes ownership',
        minimum: 0,
        maximum: 3,
        default: 0,
    })

    targetNewPermissionLevel: number //if true admin is revoked (does nothing if repository is not an admin already)
}
