import { ApiProperty } from "@nestjs/swagger";

//This is the scaffold for the Swagger UI POST body for updating
// an existing data model
export class UpdateDataModelFieldsDTO {
    @ApiProperty()
    resourceName: string;
    @ApiProperty()
    repository: string;
    @ApiProperty()
    dataModel: any;
}
