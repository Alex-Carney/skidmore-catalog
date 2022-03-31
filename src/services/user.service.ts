import { PrismaService } from '../modules/prisma/services/prisma.service';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException
} from "@nestjs/common";
import { PasswordService } from '../modules/authentication/services/password.service';
// import { ChangePasswordInput } from '../resolvers/repository/dto/change-password.input';
// import { UpdateUserInput } from '../resolvers/repository/dto/update-user.input';
import { Prisma, User } from '@prisma/client';
import { Request } from "express";
import { AuthService } from '../modules/authentication/services/auth.service';
import { UserBusinessErrors } from "../errors/user.error";

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
    private authService: AuthService,
  ) {}

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
   *
   * @param userEmail
   * @throws NotFoundException
   */
  async getUserFromEmail(userEmail: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: userEmail,
      },
    })
    if(!user) {
      const exceptionToThrow = UserBusinessErrors.UserNotFound;
      exceptionToThrow.additionalInformation = 'No user with email ' + userEmail + ' found'
      throw new NotFoundException(exceptionToThrow);
    }
    return user;

  }

  /**
   *
   * @param req
   * @throws NotFoundException through call to getUserFromToken
   */
  async getUserFromRequest(req: Request): Promise<User> {
    const authHeader = req.headers['authorization'];
    if(!authHeader) {
      throw new ForbiddenException(UserBusinessErrors.UserNotAuthenticated)
    }
    const token = authHeader.split(' ')[1];
    return this.authService.getUserFromToken(token);
  }

  // async updateRoles(
  //   userId: string,
  //   newRoles: string[],
  //   remove: boolean,
  // ){
  //   //first get the current list, then update it with the new version
  //   const repository = await this.prisma.repository.findUnique({
  //      where: { id: userId }
  //   });
  //   //get the roles and add the array of new ones to it
  //   const roles = repository['roles'];
  //
  //   let idx: number;
  //   if(remove) {
  //     newRoles.forEach((e) => {
  //       idx = roles.indexOf(e);
  //       if(idx > -1) {roles.splice(idx, 1);}
  //     })
  //   } else {
  //     newRoles.forEach((e) => roles.push(e));
  //   }
  //
  //   return this.prisma.repository.update({
  //     data: {
  //       roles: roles
  //     },
  //   where: { id: userId },
  //   });
  // }

  // async getRoles(userWhereUniqueInput: Prisma.UserWhereUniqueInput) {
  //   return this.prisma.repository.findUnique({
  //     where: userWhereUniqueInput,
  //   })['roles']

  // }


}
