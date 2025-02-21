import { DataSource } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';

export async function seedTestUser(dataSource: DataSource): Promise<void> {
    const userRepository = dataSource.getRepository(User);

    const testUserEmail = 'test@example.com';
    const testUserPassword = 'password';

    // Check if the test user already exists
    const existingUser = await userRepository.findOneBy({ email: testUserEmail });
    if (existingUser) {
        console.log('Test user already exists.');
        return;
    }

    // Create the test user
    const hashedPassword = await bcrypt.hash(testUserPassword, 10);

    const testUser = userRepository.create({
        email: testUserEmail,
        password: hashedPassword,
        name: 'Test User',
        isActive: true,
        role: 'admin',
    });

    await userRepository.save(testUser);
    console.log('Test user created successfully.');
}
