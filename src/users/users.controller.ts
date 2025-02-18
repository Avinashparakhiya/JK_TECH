import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    HttpCode,
    HttpStatus,
    NotFoundException,
    UseGuards,
  } from '@nestjs/common';
  import { UsersService } from './users.service';
  import { User } from './entities/user.entity';
  import { RegisterUserDto } from '../auth/dto/register-user.dto';
  import { JwtStrategy } from '../auth/strategies/jwt.strategy';
  import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
  
  @ApiTags('users')
  @Controller('users')
  export class UsersController {
    constructor(private readonly usersService: UsersService) {}
  
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new user' })
    @ApiResponse({ status: 201, description: 'User successfully created.' })
    @ApiResponse({ status: 400, description: 'Bad request.' })
    async create(@Body() registerUserDto: RegisterUserDto): Promise<User> {
      return this.usersService.create(registerUserDto);
    }
  
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtStrategy)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get a user by ID' })
    @ApiResponse({ status: 200, description: 'User found.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    async findById(@Param('id') id: string): Promise<User> {
      const user = await this.usersService.findById(id);
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found.`);
      }
      return user;
    }
  
    @Get()
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtStrategy)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ status: 200, description: 'Users retrieved successfully.' })
    async findAll(): Promise<User[]> {
      return this.usersService.findAll();
    }
  }
  