import { ApiProperty } from "@nestjs/swagger";

//Data transfer object for updating the names of data model fields.
// This is a separate route than updating the data model (by adding/removing columns
// or changing data type)
export class UpdateDataModelFieldNamesDTO {
  @ApiProperty()
  resourceName: string;
  @ApiProperty()
  repository: string;
  @ApiProperty({
    example: {"oldFieldName": "newFieldName"}
  })
  fieldNameRemapping: Map<string, string>;
}
