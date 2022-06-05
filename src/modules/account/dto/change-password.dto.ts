import { ApiProperty } from "@nestjs/swagger";
import { FieldNames } from "../../../decorators/field-names.decorator";

/**
 * Data transfer object for changing password
 * @author Alex Carney
 */
@FieldNames('oldPassword', 'newPassword')
export class ChangePasswordDTO {
  @ApiProperty({
    description: "Re-enter old password",
  })
  oldPassword: string;

  @ApiProperty({
    description: "New password",
  })
  newPassword: string;
}
