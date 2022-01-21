import { ApiProperty } from "@nestjs/swagger";

//This is the scaffold for the Swagger UI POST body for creating a new data model 
export class QueryDatabaseInputDTO {
    @ApiProperty()
    resourceName: string;
    @ApiProperty()
    repository: string;
    @ApiProperty()
    SQL_Select_Statement: string;
    @ApiProperty()
    SQL_Where_Statement: string;
    
}