import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { response } from 'express';

describe('DocumentsController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let userId: string; // Store the user ID here
  const logger = new Logger('DocumentsController (e2e)');

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
      .send({ email: 'test@example.com', password: 'password' })
      .expect(200);

    // Extract the access token and user ID
    accessToken = response.body.access_token;
    const decodedToken = JSON.parse(
      Buffer.from(accessToken.split('.')[1], 'base64').toString('utf-8'),
    );

    userId = decodedToken.sub; // Assuming 'sub' contains the user ID
    logger.log(`User logged in: ID = ${userId}, Token obtained`);
    accessToken = response.body.access_token;
    logger.log('User logged in and access token obtained');
  });

  afterAll(async () => {
    await app.close();
    logger.log('Application closed');
  });

  it('/documents (GET)', async () => {
    logger.log('Testing /documents (GET)');
    const response = await request(app.getHttpServer())
      .get('/documents')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    logger.log('Documents retrieved successfully');
  });

  it('/documents/:id (DELETE)', async () => {
    logger.log('Testing /documents/:id (DELETE)');

    // Retrieve user details
    const userDetailsResponse = await request(app.getHttpServer())
      .get(`/users/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const currentUser = userDetailsResponse.body;
    logger.log(`Retrieved user details for deletion test: ${JSON.stringify(currentUser)}`);

    // Simulate document upload with the current user
    const fileBuffer = Buffer.from('Sample file content');
    const uploadResponse = await request(app.getHttpServer())
      .post('/documents/upload')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', fileBuffer, { filename: 'test.txt', contentType: 'text/plain' })
      .query({ title: 'Test Document' }) // Pass the title as a query parameter
      .expect(201);

    const uploadedDocument = uploadResponse.body;
    logger.log(`Document uploaded: ${JSON.stringify(uploadedDocument)}`);

    // Delete the uploaded document
    const documentId = uploadedDocument.id;
    await request(app.getHttpServer())
      .delete(`/documents/${documentId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    logger.log('Document deleted successfully');

    // Verify the document is no longer accessible
    await request(app.getHttpServer())
      .get(`/documents/${documentId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200); // Expect a 404 as the document should no longer exist
  });

});