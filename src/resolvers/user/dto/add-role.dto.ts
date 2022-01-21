import { ApiProperty } from "@nestjs/swagger";

//This is the scaffold for the Swagger UI POST body for adding new roles to a user 
export class UserAddRoleDTO {
    @ApiProperty()
    roles: string[]
}