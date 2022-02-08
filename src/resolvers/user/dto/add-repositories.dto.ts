import { ApiProperty } from "@nestjs/swagger";

//This is the scaffold for the Swagger UI POST body for adding new roles to a user
export class UserCreateRepositoryDTO {
    @ApiProperty({
        description: "A list of repositories to create. It is recommended to follow naming conventions",
        example: "LASTNAME_REPOSITORY_NAME",
        isArray: true,
    })
    repositories: string[]
}
