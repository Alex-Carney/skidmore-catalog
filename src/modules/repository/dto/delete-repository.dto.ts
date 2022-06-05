import { ApiProperty } from "@nestjs/swagger";
import { FieldNames } from "../../../decorators/field-names.decorator";


//This is the scaffold for the Swagger UI POST body for removing roles
@FieldNames("repository")
export class DeleteRepositoryDTO {
    @ApiProperty({
        description: "Title of role to delete",
    })
    repository: string
}
