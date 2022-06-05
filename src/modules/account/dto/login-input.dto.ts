import { ApiProperty } from "@nestjs/swagger";
import { FieldNames } from "../../../decorators/field-names.decorator";

/**
 * Data transfer object for logging in
 * @author Alex Carney
 */
@FieldNames('email', 'password')
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
