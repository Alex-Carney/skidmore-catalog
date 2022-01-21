import { ApiProperty } from "@nestjs/swagger";

//This is the scaffold for the Swagger UI POST body for creating a new data model 
export class SeedDatabaseInputDTO {
    @ApiProperty()
    resourceName: string;
    @ApiProperty()
    repository: string;
    @ApiProperty({type: 'string', format: 'binary'})
    file: any;
}