import { ApiProperty } from "@nestjs/swagger";

//This is the scaffold for the Swagger UI POST
// body for changing the repository permissions associated with a
// data model
export class UpdateDataModelRepositoriesDTO {
    @ApiProperty()
    resourceName: string;
    @ApiProperty()
    repository: string;
    @ApiProperty()
    removeRepositories: boolean;

}
