import { ApiProperty } from "@nestjs/swagger";

//This is the scaffold for the Swagger UI POST body for creating a new data model
export class DataModelPublishInputDTO {
    @ApiProperty()
    resourceName: string;
    @ApiProperty()
    repositories: string[];
    @ApiProperty()
    dataModel: Record<string, Array<string>>;
}
