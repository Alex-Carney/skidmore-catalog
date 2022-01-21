import { PrismaModule } from './../../prisma/prisma.module';
import { Module } from '@nestjs/common';
import { UserService } from '../../services/user.service';
import { PasswordService } from '../../services/password.service';
import { UserController } from 'src/controllers/user.controller';
import { AuthService } from 'src/services/auth.service';
import { JwtService } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';
import { RoleService } from 'src/services/role.service';
//import { RoleModule } from '../role/role.module';

@Module({
  imports: [PrismaModule, AuthModule, /**RoleModule**/],
  controllers: [UserController],
  providers: [UserService, PasswordService, RoleService],
  exports: [UserService, RoleService],
})
export class UserModule {}
