import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    UseGuards,
    Req,
    Res,
  } from '@nestjs/common';
  import { AuthService } from './auth.service';
  import { RegisterUserDto } from './dto/register-user.dto';
  import { LoginUserDto } from './dto/login-user.dto';
  import { LocalStrategy } from './strategies/local.strategy';
  import { JwtStrategy } from './strategies/jwt.strategy';
  import { Request, Response } from 'express';
  import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
  import { User } from '../users/entities/user.entity';

  @ApiTags('auth')
  @Controller('auth')
  export class AuthController {
    constructor(private readonly authService: AuthService) {}
  
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Register a new user' })
    @ApiBody({ type: RegisterUserDto })
    @ApiResponse({ status: 201, description: 'User successfully registered.' })
    @ApiResponse({ status: 400, description: 'Bad request.' })
    async register(@Body() registerUserDto: RegisterUserDto) {
      return this.authService.register(registerUserDto);
    }
  
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @UseGuards(LocalStrategy)
    @ApiOperation({ summary: 'Login a user' })
    @ApiBody({ type: LoginUserDto })
    @ApiResponse({ status: 200, description: 'User successfully logged in.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    async login(@Req() req: Request & { user: User }, @Res({ passthrough: true }) res: Response) {
      const { access_token } = await this.authService.login(req.user);
      res.cookie('access_token', access_token, { httpOnly: true });
      return { message: 'Login successful', access_token };
    }
  
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtStrategy)
    @ApiOperation({ summary: 'Logout a user' })
    @ApiResponse({ status: 200, description: 'User successfully logged out.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    async logout(@Res({ passthrough: true }) res: Response) {
      res.clearCookie('access_token');
      return { message: 'Logout successful' };
    }
  }