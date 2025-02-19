import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('DocumentsController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' })
      .expect(200);

    accessToken = response.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/documents (GET)', () => {
    return request(app.getHttpServer())
      .get('/documents')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });

  it('/documents/:id (DELETE)', () => {
    return request(app.getHttpServer())
      .delete('/documents/1')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });
});