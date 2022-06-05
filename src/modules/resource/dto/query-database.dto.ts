import { ApiProperty } from "@nestjs/swagger";
import { FieldNames } from "../../../decorators/field-names.decorator";

//This is the scaffold for the Swagger UI POST body
// for querying the database
@FieldNames("resourceName", "repository", "SQL_Select_Fields", "SQL_Where_Fields", "SQL_Where_Statement")
export class QueryDatabaseInputDTO {
    @ApiProperty()
    resourceName: string;
    @ApiProperty()
    repository: string;
    @ApiProperty()
    SQL_Select_Fields: string;
    @ApiProperty()
    SQL_Where_Fields: string;
    @ApiProperty()
    SQL_Where_Statement: string;

}
