import { PrismaService } from './../prisma/prisma.service';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from './password.service';
import { SignupInput } from '../resolvers/auth/dto/signup.input';
import { Prisma, User } from '@prisma/client';
import { Token } from '../models/token.model';
import { ConfigService } from '@nestjs/config';
import { SecurityConfig } from 'src/configs/config.interface';
import { Request } from "express";
import { UserBusinessErrors } from "../errors/user.error";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService
  ) {}


  //--------------------------------------------------------------------

  // async createUser(payload: SignupInput): Promise<Token> {
  //   const hashedPassword = await this.passwordService.hashPassword(
  //     payload.password
  //   );

  //   try {
  //     const user = await this.prisma.user.create({
  //       data: {
  //         ...payload,
  //         password: hashedPassword,
  //         //role: [], //changed this from role: 'USER' which didn't do anything
  //       },
  //     });

  //     return this.generateTokens({
  //       userId: user.id,
  //     });
  //   } catch (e) {
  //     if (
  //       e instanceof Prisma.PrismaClientKnownRequestError &&
  //       e.code === 'P2002'
  //     ) {
  //       throw new ConflictException(`Email ${payload.email} already used.`);
  //     } else {
  //       throw new Error(e);
  //     }
  //   }
  // }

 async createUser(email: string, password: string, firstname: string, lastname: string): Promise<Token> {
    const hashedPassword = await this.passwordService.hashPassword(
      password
    );

    try {
      const user = await this.prisma.user.create({
        data: {
          email: email,
          firstname: firstname,
          lastname: lastname,
          password: hashedPassword,
          //role: [], //changed this from role: 'USER' which didn't do anything
        },
      });

      return this.generateTokens({
        userId: user.id,
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException(`Email ${email} already used.`);
      } else {
        throw new Error(e);
      }
    }
  }

  //--------------------------------------------------------------------

  async login(email: string, password: string): Promise<Token> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }

    const passwordValid = await this.passwordService.validatePassword(
      password,
      user.password
    );

    if (!passwordValid) {
      throw new BadRequestException('Invalid password');
    }

    return this.generateTokens({
      userId: user.id,
    });
  }

    //--------------------------------------------------------------------


  validateUser(userId: string): Promise<User> {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

    //--------------------------------------------------------------------

  getUserFromToken(token: string): Promise<User> {
    const id = this.jwtService.decode(token)['userId'];
    const foundUser = this.prisma.user.findUnique({ where: { id } });
    if(!foundUser) {
      throw new NotFoundException(UserBusinessErrors.UserNotFound);
    }
    return foundUser
  }

    //--------------------------------------------------------------------

  async getUserFromRequest(req: Request): Promise<User> {
    const authHeader = req.headers['authorization'];
    const token = authHeader.split(' ')[1];
    return this.getUserFromToken(token);
  }

    //--------------------------------------------------------------------

  generateTokens(payload: { userId: string }): Token {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

    //--------------------------------------------------------------------

  private generateAccessToken(payload: { userId: string }): string {
    return this.jwtService.sign(payload);
  }

    //--------------------------------------------------------------------

  private generateRefreshToken(payload: { userId: string }): string {
    const securityConfig = this.configService.get<SecurityConfig>('security');
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: securityConfig.refreshIn,
    });
  }

    //--------------------------------------------------------------------

  refreshToken(token: string) {
    try {
      const { userId } = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      return this.generateTokens({
        userId,
      });
    } catch (e) {
      throw new UnauthorizedException();
    }
  }


    //--------------------------------------------------------------------

}
