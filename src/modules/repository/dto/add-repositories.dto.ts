import { ApiProperty } from "@nestjs/swagger";
import { FieldNames } from "../../../decorators/field-names.decorator";

//This is the scaffold for the Swagger UI POST body for adding new roles to a repository
@FieldNames('repository')
export class UserCreateRepositoryDTO {
    @ApiProperty({
        description: "A repository to create. It is recommended to follow naming conventions",
        example: "LASTNAME_REPOSITORY_NAME",
    })
    repository: string
}
