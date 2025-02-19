import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    console.log('Validating user:', email);
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      console.log('User not found or invalid credentials');
      throw new UnauthorizedException();
    }
    console.log('User validated:', user);
    return user;
  }
}