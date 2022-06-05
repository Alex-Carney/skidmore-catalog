import { ApiProperty } from "@nestjs/swagger";
import { FieldNames } from "../../../decorators/field-names.decorator";

//This is the scaffold for the Swagger UI POST body for updating
// an existing data model
@FieldNames("resourceName", "repository", "dataModel")
export class UpdateDataModelFieldsDTO {
    @ApiProperty()
    resourceName: string;
    @ApiProperty()
    repository: string;
    @ApiProperty()
    dataModel: any;
}
