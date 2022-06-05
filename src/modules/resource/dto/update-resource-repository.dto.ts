import { ApiProperty } from "@nestjs/swagger";
import { FieldNames } from "../../../decorators/field-names.decorator";

//This is the scaffold for the Swagger UI POST
// body for changing the repository permissions associated with a
// data model
@FieldNames("resourceName", "repository", "removeRepositories")
export class UpdateDataModelRepositoriesDTO {
    @ApiProperty()
    resourceName: string;
    @ApiProperty()
    repository: string;
    @ApiProperty()
    removeRepositories: boolean;

}
