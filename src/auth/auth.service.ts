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
  ) { }

  async register(registerUserDto: RegisterUserDto) {
    const requiredFields = ['password', 'email', 'name'];
    for (const field of requiredFields) {
      if (!registerUserDto[field]) {
        throw new HttpException(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`, HttpStatus.BAD_REQUEST);
      }
    }

    const { password } = registerUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.usersService.create({
      ...registerUserDto,
      password: hashedPassword,
    });
  }

  async validateUser(email: string, password: string): Promise<any> {
    console.log('Validating user in AuthService:', email);
    const user = await this.usersService.findByEmail(email);
    console.log('user:', user);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email }; // Use user.id instead of user.password
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}