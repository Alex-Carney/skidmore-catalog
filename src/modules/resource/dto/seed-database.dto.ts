import { ApiProperty } from "@nestjs/swagger";

//This is the scaffold for the Swagger UI POST body
// for seeding the database
export class SeedDatabaseInputDTO {
    @ApiProperty()
    resourceName: string;
    @ApiProperty()
    repository: string;
    @ApiProperty()
    maxBufferSize: number;
    @ApiProperty({
        description: "Delimiter for incoming data. Use %09 for tab and %20 for space",
        example: ","
    })
    delimiter: string;
    @ApiProperty({type: 'string', format: 'binary'})
    file: any;
}
