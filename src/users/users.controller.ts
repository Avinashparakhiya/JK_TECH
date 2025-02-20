import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  NotFoundException,
  UseGuards,
  ForbiddenException,
  Delete,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { RegisterUserDto } from '../auth/dto/register-user.dto';
import { UpdateUserDto } from 'src/auth/dto/update-user.dto';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

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
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: 200, description: 'User found.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async findById(@Param('id') id: string): Promise<User> {
    const user = await this.usersService.findActiveById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    return user;
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @Roles('admin', 'editor')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Req() req: Request): Promise<User> {
    const user = await this.usersService.findActiveById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    if (!updateUserDto) {
      throw new NotFoundException(`Please Add Role Or Name.`);
    }
    // Only admins can change roles
    const currentUser = await this.usersService.getCurrentUser(req);
    if (updateUserDto.role && updateUserDto.role !== user.role) {
      if (!currentUser || currentUser.role !== 'admin') {
        throw new ForbiddenException('Only admins can change roles.');
      }
    }

    return this.usersService.update(id, updateUserDto, currentUser);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin') // Only 'admin' role can access
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async findAll(): Promise<User[]> {
    return this.usersService.findAllActive(); // Replace with your actual implementation
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async delete(@Param('id') id: string): Promise<void> {
    const user = await this.usersService.findActiveById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    await this.usersService.softDelete(id);
  }
}