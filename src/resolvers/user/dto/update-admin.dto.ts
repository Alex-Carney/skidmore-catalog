import { ApiProperty } from "@nestjs/swagger";

//This is the scaffold for the Swagger UI POST body for adding new roles to a user 
export class UpdateRoleAdminDTO {
    @ApiProperty()
    remove: boolean //if true admin is revoked (does nothing if user is not an admin already)
    @ApiProperty()
    role: string //title of role == unique identifier 
    @ApiProperty()
    receiverEmail: string //email of user == unique identifier 
}