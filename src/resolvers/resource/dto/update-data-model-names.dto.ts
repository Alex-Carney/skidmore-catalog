import { ApiProperty } from "@nestjs/swagger";

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
