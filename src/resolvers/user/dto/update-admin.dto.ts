import { ApiProperty } from "@nestjs/swagger";

//This is the scaffold for the Swagger UI POST body for adding new roles to a user
export class UpdateRepositoryPermissionsDTO {
    @ApiProperty({
        description: 'title of repository to change permissions for',
        default: 'REPOSITORY_NAME'
    })
    repository: string //title of role == unique identifier
    @ApiProperty({
        description: 'The email address of an existing user to change the permission level of',
        default: 'username@skidmore.edu'
    })
    receiverEmail: string //email of user == unique identifier
    @ApiProperty({
        description: 'New permission level of recipient. 0 revokes all access, 1 grants read/write, 2 grants administration, 3 changes ownership',
        minimum: 0,
        maximum: 3,
        default: 0,
    })
    permissionLevel: number //if true admin is revoked (does nothing if user is not an admin already)
}
