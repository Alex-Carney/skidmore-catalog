import { ApiProperty } from "@nestjs/swagger";

/**
 * Data transfer object for changing password
 * @author Alex Carney
 */
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
