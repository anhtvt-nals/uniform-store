import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Admin API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1/admin');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/health (GET) should return 200', () => {
    return request(app.getHttpServer()).get('/health').expect(200);
  });

  it('/ready (GET) should return 200', () => {
    return request(app.getHttpServer()).get('/ready').expect(200);
  });

  it('/api/v1/admin/auth/login (POST) should return 200', () => {
    return request(app.getHttpServer())
      .post('/api/v1/admin/auth/login')
      .send({ email: 'admin@example.com', password: 'password' })
      .expect(201);
  });
});
