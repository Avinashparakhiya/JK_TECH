// filepath: /C:/Users/user/Documents/jk_tech/src/users/users.service.ts
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterUserDto } from '../auth/dto/register-user.dto';
import { UpdateUserDto } from 'src/auth/dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(registerUserDto: RegisterUserDto): Promise<User> {
    const user = this.userRepository.create(registerUserDto);
    user.role = 'viewer'; // Default role is viewer
    return this.userRepository.save(user);
  }

  async findAllActive(): Promise<User[]> {
    return this.userRepository.find({ where: { isActive: true } });
  }

  async findActiveById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id, isActive: true } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findActiveById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    // Only allow role changes if the current user is an admin
    if (updateUserDto.role && updateUserDto.role !== user.role) {
      const currentUser = await this.getCurrentUser(); // Implement this method to get the current user from the JWT
      if (!currentUser || currentUser.role !== 'admin') {
        throw new ForbiddenException('Only admins can change roles.');
      }
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async getCurrentUser(): Promise<User | null> {
    // Implement this method to get the current user from the JWT
    // This is just a placeholder implementation
    return this.userRepository.findOne({ where: { id: 'current-user-id' } });
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