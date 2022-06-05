import { ApiProperty } from "@nestjs/swagger";
import { FieldNames } from "../../../decorators/field-names.decorator";

//This is the scaffold for the Swagger UI POST body for creating a new data model
@FieldNames("resourceName", "repository", "dataModel")
export class DataModelPublishInputDTO {
    @ApiProperty()
    resourceName: string;
    @ApiProperty()
    repository: string;
    @ApiProperty()
    dataModel: Record<string, Array<string>>;
}
