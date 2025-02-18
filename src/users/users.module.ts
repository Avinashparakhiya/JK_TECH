import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthModule], // Import User entity and AuthModule for user-related authentication
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Export UsersService for other modules to access
})
export class UsersModule {}
