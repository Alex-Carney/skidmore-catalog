import { PrismaService } from "../modules/prisma/services/prisma.service";
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PasswordService } from "../modules/authentication/services/password.service";
// import { ChangePasswordInput } from '../resolvers/repository/dto/change-password.input';
// import { UpdateUserInput } from '../resolvers/repository/dto/update-user.input';
import { User } from "@prisma/client";
import { Request } from "express";
import { AuthService } from "../modules/authentication/services/auth.service";
import { UserBusinessErrors } from "../errors/user.error";

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
    private authService: AuthService
  ) {
  }

  // async updateUser(userId: string, newUserData: UpdateUserInput) {
  //    return this.prisma.user.update({
  //      data: newUserData,
  //      where: {
  //        id: userId,
  //      },
  //    });
  //  }

  // async changePassword(
  //   userId: string,
  //   userPassword: string,
  //   changePassword: ChangePasswordInput
  // ) {
  //   const passwordValid = await this.passwordService.validatePassword(
  //     changePassword.oldPassword,
  //     userPassword
  //   );
  //
  //   if (!passwordValid) {
  //     throw new BadRequestException('Invalid password');
  //   }
  //
  //   const hashedPassword = await this.passwordService.hashPassword(
  //     changePassword.newPassword
  //   );
  //
  //   return this.prisma.user.update({
  //     data: {
  //       password: hashedPassword,
  //     },
  //     where: { id: userId },
  //   });
  // }

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
