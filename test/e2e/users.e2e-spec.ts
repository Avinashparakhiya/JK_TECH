import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let userId: string;
  const logger = new Logger('UsersController (e2e)');

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    logger.log('Application initialized');

    // Log in and retrieve the access token
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password',
      })
      .expect(200);
    accessToken = response.body.access_token;
    logger.log('User logged in and access token obtained');

    const decodedToken = JSON.parse(
      Buffer.from(accessToken.split('.')[1], 'base64').toString('utf-8'),
    );

    userId = decodedToken.sub; // Assuming 'sub' contains the user ID
  });

  afterAll(async () => {
    await app.close();
    logger.log('Application closed');
  });

  it('/users (GET)', async () => {
    logger.log('Testing /users (GET)');
    const response = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    logger.log('Users retrieved successfully');
  });

  it('/users/:id (GET)', async () => {
    logger.log('Testing /users/:id (GET)');
    const response = await request(app.getHttpServer())
      .get(`/users/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('email');
    expect(response.body).toHaveProperty('role');
    logger.log('User details retrieved successfully');
  });
});
