import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ConfigModule, // For managing environment variables
    TypeOrmModule.forFeature([User]), // Inject User repository
    PassportModule, // For authentication strategies
    JwtModule.register({
      secret: "!@##$$%^&",
      signOptions: { expiresIn: '60m' },
    }),
    UsersModule, // Import UsersModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersService,
    LocalStrategy,
    JwtStrategy,
  ],
  exports: [AuthService], // Export AuthService for use in other modules
})
export class AuthModule {}