import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('IngestionController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  const logger = new Logger('IngestionController (e2e)');

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    logger.log('Application initialized');

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' })
      .expect(200);

    accessToken = response.body.access_token;
    logger.log('User logged in and access token obtained');
  });

  afterAll(async () => {
    await app.close();
    logger.log('Application closed');
  });

  it('/ingestion/total-users-by-role (GET)', () => {
    logger.log('Testing /ingestion/total-users-by-role (GET)');
    return request(app.getHttpServer())
      .get('/ingestion/total-users-by-role')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });

  it('/ingestion/documents-uploaded-by-role (GET)', () => {
    logger.log('Testing /ingestion/documents-uploaded-by-role (GET)');
    return request(app.getHttpServer())
      .get('/ingestion/documents-uploaded-by-role')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });
});