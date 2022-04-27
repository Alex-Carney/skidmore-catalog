import { ApiProperty } from "@nestjs/swagger";

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
