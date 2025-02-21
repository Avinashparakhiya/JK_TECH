import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  const logger = new Logger('AuthController (e2e)');

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    logger.log('Application initialized');
  });

  afterAll(async () => {
    await app.close();
    logger.log('Application closed');
  });

  it('/auth/login (POST)', () => {
    logger.log('Testing /auth/login (POST)');
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' })
      .expect(200)
      .then((response) => {
        expect(response.body).toHaveProperty('access_token');
      });
  });
});