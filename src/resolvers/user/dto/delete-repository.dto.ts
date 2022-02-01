import { ApiProperty } from "@nestjs/swagger";

//This is the scaffold for the Swagger UI POST body for removing roles
export class DeleteRepositoryDTO {
    @ApiProperty({
        description: "Title of role to delete"
    })
    repository: string
}
