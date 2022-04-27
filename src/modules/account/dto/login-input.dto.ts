import { ApiProperty } from "@nestjs/swagger";

export class LoginInputDTO {
  @ApiProperty({
    description: "User email",
  })
  email: string;

  @ApiProperty({
    description: "Password",
  })
  password: string;
}
