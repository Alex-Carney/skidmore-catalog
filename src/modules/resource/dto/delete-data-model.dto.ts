import { ApiProperty } from "@nestjs/swagger";
import { FieldNames } from "../../../decorators/field-names.decorator";

//This is the scaffold for the Swagger UI POST body for
// deleting a data model
@FieldNames("resourceName", "repository")
export class DeleteDataModelDTO {
    @ApiProperty()
    resourceName: string;
    @ApiProperty()
    repository: string;
}
