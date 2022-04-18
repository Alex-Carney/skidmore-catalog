import { ApiProperty } from "@nestjs/swagger";

//This is the scaffold for the Swagger UI POST body for creating a new data model
export class DataModelGenerateInputDTO {
    @ApiProperty({type: 'string', format: 'binary'})
    file: any;
    @ApiProperty()
    delimiter: string;
}
