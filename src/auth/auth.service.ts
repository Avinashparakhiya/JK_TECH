import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerUserDto: RegisterUserDto) {
    try {
      const requiredFields = ['password', 'email', 'name'];
      for (const field of requiredFields) {
        if (!registerUserDto[field]) {
          throw new HttpException(
            `${field.charAt(0).toUpperCase() + field.slice(1)} is required`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      // Check if the email already exists
      const existingUser = await this.usersService.findByEmail(registerUserDto.email);
      if (existingUser) {
        throw new HttpException(
          'Your email is already registered. Please log in.',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.usersService.create({
        ...registerUserDto,
      });
    } catch (error) {
      throw new HttpException(`Error during registration: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async validateUser(email: string, password: string): Promise<any> {
    try {
      // Fetch user by email
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        throw new HttpException(
          'Your email is not registered. Please register and login.',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Compare plaintext password with the hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
      }

      // Exclude the password field from the returned user object
      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      throw new HttpException(`Error validating user: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async login(user: any) {
    try {
      const payload = { sub: user.id, email: user.email }; // Use user.id instead of user.password
      return {
        access_token: this.jwtService.sign(payload),
      };
    } catch (error) {
      throw new HttpException(`Error during login: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
