import { ApiProperty } from "@nestjs/swagger";

//This is the scaffold for the Swagger UI POST body
// for querying the database
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
