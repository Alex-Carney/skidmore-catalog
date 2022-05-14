import { PrismaService } from "../../prisma/services/prisma.service";
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PasswordService } from "../../authentication/services/password.service";
import { User } from "@prisma/client";
import { Request } from "express";
import { AuthService } from "../../authentication/services/auth.service";
import { UserBusinessErrors } from "../../../errors/user.error";
import { ChangePasswordDTO } from "../dto/change-password.dto";

@Injectable()
export class UserService {
  /**
   * An injectable service for user actions and validation
   * @param prisma dependency
   * @param passwordService dependency
   * @param authService dependency
   */
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
    private authService: AuthService
  ) {
  }

  /**
   * Logic to change a user's password
   * @param userId ID of user performing action
   * @param changePassword contains user's input for their old password (to validate
   * against userPassword), along with newPassword
   */
  async changePassword(
    userId: string,
    changePassword: ChangePasswordDTO
  ) {

    const validUser: User = await this.prisma.user.findUnique({
      where: {
        id: userId
      }
    })

    const passwordValid = await this.passwordService.validatePassword(
      changePassword.oldPassword,
      validUser.password
    );

    if (!passwordValid) {
      throw new BadRequestException('Invalid password');
    }

    const hashedPassword = await this.passwordService.hashPassword(
      changePassword.newPassword
    );

    return this.prisma.user.update({
      data: {
        password: hashedPassword,
      },
      where: { id: userId },
    });
  }

  /**
   * Returns a user object from just an email, we assume the email is unique.
   * @param userEmail
   * @throws NotFoundException
   */
  async getUserFromEmail(userEmail: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: userEmail
      }
    });
    if (!user) {
      const exceptionToThrow = UserBusinessErrors.UserNotFound;
      exceptionToThrow.additionalInformation = "No user with email " + userEmail + " found";
      throw new NotFoundException(exceptionToThrow);
    }
    return user;

  }

  /**
   * Returns a user object when supplied a request object directly.
   * @param req
   * @throws NotFoundException through call to getUserFromToken
   */
  async getUserFromRequest(req: Request): Promise<User> {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      throw new ForbiddenException(UserBusinessErrors.UserNotAuthenticated);
    }
    const token = authHeader.split(" ")[1];
    return this.authService.getUserFromToken(token);
  }
}
