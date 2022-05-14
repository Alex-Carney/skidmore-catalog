import { PrismaService } from '../../prisma/services/prisma.service';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  UnauthorizedException, ForbiddenException
} from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from './password.service';
import { Prisma, User } from '@prisma/client';
import { Token } from '../../../models/token.model';
import { ConfigService } from '@nestjs/config';
import { SecurityConfig } from 'src/configs/config.interface';
import { UserBusinessErrors } from "../../../errors/user.error";

@Injectable()
/**
 * An injectable class to handle authentication services
 * @author Starter project, edited by Alex Carney
 */
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService
  ) {}


  //--------------------------------------------------------------------
  /**
   * Create a new user in the database
   * @param email
   * @param password
   * @param firstname
   * @param lastname
   */
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
          password: hashedPassword
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

  /**
   * Login functionality
   * @param email
   * @param password
   */
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


  /**
   * Returns a user object if they exist
   * @param userId ID to search for user by
   */
  validateUser(userId: string): Promise<User> {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

    //--------------------------------------------------------------------

  /**
   * Returns a user object just from a JWT authentication token
   * @param token
   * @throws NotFoundException
   */
  getUserFromToken(token: string): Promise<User> {
    const decodedToken = this.jwtService.decode(token);
    if(!decodedToken) {
      throw new ForbiddenException(UserBusinessErrors.InvalidBearerToken)
    }
    const id = decodedToken['userId']
    const foundUser = this.prisma.user.findUnique({ where: { id } });
    if(!foundUser) {
      throw new NotFoundException(UserBusinessErrors.UserNotFound);
    }
    return foundUser
  }

    // JWT TOKEN MANAGEMENT
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
