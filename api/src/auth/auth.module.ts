import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './models/user.entity';
import { JwtGuard } from './guards/jwt.guard';
import { JwtStartegy } from './guards/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { MulterModule } from '@nestjs/platform-express';
import { FriendRequestEntity } from './models/friend-request.entity';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: {
          expiresIn: '36d',
        },
      }),
    }),
    TypeOrmModule.forFeature([UserEntity, FriendRequestEntity]),
    MulterModule.register({
      dest: './images',
    }),
  ],
  controllers: [AuthController, UserController],
  providers: [AuthService, JwtGuard, JwtStartegy, RolesGuard, UserService],
  exports: [AuthService, UserService],
})
export class AuthModule {}
