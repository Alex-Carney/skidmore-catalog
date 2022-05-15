import { ApiProperty } from "@nestjs/swagger";

//This is the scaffold for the Swagger UI POST body for
// deleting a data model
export class DeleteDataModelDTO {
    @ApiProperty()
    resourceName: string;
    @ApiProperty()
    repository: string;
}
