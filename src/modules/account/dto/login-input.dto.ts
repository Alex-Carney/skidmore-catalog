import { ApiProperty } from "@nestjs/swagger";

/**
 * Data transfer object for logging in
 * @author Alex Carney
 */
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
