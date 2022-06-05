import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Body, Controller, Logger, Post, Req, UseGuards } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { Token } from "../../../models/token.model";
import { AuthService } from "../../authentication/services/auth.service";
import { LoginInputDTO } from "../dto/login-input.dto";
import { Request } from "express";
import { ChangePasswordDTO } from "../dto/change-password.dto";
import { ProperBodyGuard } from "../../../guards/proper-body.guard";
import { BodyDto } from "../../../decorators/route-dto.decorator";


/**
 * Allows users to access account settings through the API, including logging in,
 * changing password, and deleting account
 * @author Alex Carney
 */
@ApiTags("Account Actions")
@Controller("account")
export class UserController {

  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService,
              private readonly authService: AuthService) {
  }

  /**
   * Route for signing in from external source, not from browser.
   * Returns nothing but the authorization token.
   * @param req
   * @param loginInputDTO
   */
  @Post("/authorize")
  @UseGuards(ProperBodyGuard)
  @BodyDto(LoginInputDTO)
  async loginRemote(@Req() req: Request, @Body() loginInputDTO: LoginInputDTO): Promise<Token> {
    this.logger.log("Attempted login by " + loginInputDTO.email);
    return this.authService.login(loginInputDTO.email, loginInputDTO.password);
  }

  /**
   * Route for changing user's password. Note that the user has to be
   * logged in to access this route. The user data is attached from
   * middleware.
   * @param req
   * @param changePasswordDTO
   */
  @ApiBearerAuth()
  @Post("/change-password")
  @UseGuards(ProperBodyGuard)
  @BodyDto(ChangePasswordDTO)
  async changePasswordRemote(@Req() req: Request, @Body() changePasswordDTO: ChangePasswordDTO) {
    return this.userService.changePassword(req.user["id"], changePasswordDTO);
  }
}
