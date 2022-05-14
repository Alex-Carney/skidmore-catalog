import { PrismaModule } from '../prisma/prisma.module';
import { PasswordService } from './services/password.service';
import { AuthService } from './services/auth.service';
import { Module } from '@nestjs/common';
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from "@nestjs/config";
import { SecurityConfig } from 'src/configs/config.interface';
import { JwtAuthGuard } from 'src/modules/authentication/guards/jwt-auth.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // Inject the secret string from the JWT access
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const securityConfig = configService.get<SecurityConfig>('security');
        return {
          secret: configService.get<string>('JWT_ACCESS_SECRET'),
          signOptions: {
            expiresIn: securityConfig.expiresIn,
          },
        };
      },
      inject: [ConfigService],
    }),
    PrismaModule,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    PasswordService,
  ],
  // Exports for other modules to use
  exports: [JwtAuthGuard, AuthService, JwtModule],
})
export class AuthModule {}
