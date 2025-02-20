// filepath: /C:/Users/user/Documents/jk_tech/src/users/users.service.ts
import { ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterUserDto } from '../auth/dto/register-user.dto';
import { UpdateUserDto } from 'src/auth/dto/update-user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService, // Inject JwtService
  ) { }

  async create(registerUserDto: RegisterUserDto): Promise<User> {
    const user = this.userRepository.create(registerUserDto);
    user.role = 'viewer'; // Default role is viewer
    return this.userRepository.save(user);
  }

  async findAllActive(): Promise<User[]> {
    return this.userRepository.find({ where: { isActive: true } });
  }

  async findActiveById(id: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({ where: { id, isActive: true } });
    } catch (error) {
      throw new HttpException(`Could not retrieve the user. Please try again later.-Error ${error}`, HttpStatus.BAD_REQUEST);
    }
  }
  

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async update(id: string, updateUserDto: UpdateUserDto,currentUser): Promise<User> {
    const user = await this.findActiveById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    // Only allow role changes if the current user is an admin
    if (updateUserDto.role && updateUserDto.role !== user.role) {
      if (!currentUser || currentUser.role !== 'admin') {
        throw new ForbiddenException('Only admins can change roles.');
      }
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async getCurrentUser(req: Request): Promise<User | null> {
    try {
      const authHeader = (req.headers as any)?.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('Authorization token not found.');
      }

      const token = authHeader.split(' ')[1];
      const payload = this.jwtService.verify(token, { secret: '!@##$$%^&' }); // Use your actual secret
      const userId = payload.sub;
      if (!userId) {
        throw new UnauthorizedException('Invalid token payload.');
      }

      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new UnauthorizedException('User not found.');
      }

      return user;
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      throw new UnauthorizedException('Failed to retrieve the current user.');
    }
  }

  async softDelete(id: string): Promise<void> {
    const user = await this.findActiveById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    user.isActive = false;
    await this.userRepository.save(user);
  }
}