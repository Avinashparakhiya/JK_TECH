import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterUserDto } from '../auth/dto/register-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Create a new user
   * @param registerUserDto - Data transfer object for creating a user
   */
  async create(registerUserDto: RegisterUserDto): Promise<User> {
    const user = this.userRepository.create(registerUserDto); // Create a new instance of the User entity

    try {
      return await this.userRepository.save(user); // Save the new user to the database
    } catch (error) {
      throw new Error('Error creating user');
    }
  }

  /**
   * Get a user by ID
   * @param id - User ID
   */
  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Get all users
   */
  async findAll(): Promise<User[]> {
    return this.userRepository.find(); // Fetch all users from the database
  }

  /**
   * Get a user by email
   * @param email - User email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }
}
