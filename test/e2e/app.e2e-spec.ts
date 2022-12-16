import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { HeartBeatModule } from '@modules/heartBeat.module';
import { ORM } from '@infra/database/ORM';
import { HeartBeat } from '@prisma/client';

describe('HeartBeatModule (e2e)', () => {
  let app: INestApplication;

  afterAll(async () => {
    await app.close();
  });

  let database: ORM;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HeartBeatModule],
    }).compile();

    database = module.get<ORM>('ORM');
    app = module.createNestApplication();
    await app.init();
  });

  it('GET /', () => {
    const result: HeartBeat[] = [
      {
        id: '123',
        group: '321',
        meta: {
          name: 'Olavio',
        },
        updatedAt: new Date('2022-12-11T11:33:40.343Z'),
        createdAt: new Date('2022-12-10T20:27:25.330Z'),
        mongoId: 'abc',
        status: 'ACTIVE',
      },
    ];

    jest.spyOn(database, 'heartBeatfindMany').mockResolvedValueOnce(result);

    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect([
        {
          id: '123',
          group: '321',
          meta: {
            name: 'Olavio',
          },
          updatedAt: '2022-12-11T11:33:40.343Z',
          createdAt: '2022-12-10T20:27:25.330Z',
          mongoId: 'abc',
          status: 'ACTIVE',
        },
      ]);
  });

  it('GET /:group', () => {
    const result: HeartBeat[] = [
      {
        id: '123',
        group: '321',
        meta: {
          name: 'Olavio',
        },
        updatedAt: new Date('2022-12-11T11:33:40.343Z'),
        createdAt: new Date('2022-12-10T20:27:25.330Z'),
        mongoId: 'abc',
        status: 'ACTIVE',
      },
    ];

    jest.spyOn(database, 'heartBeatfindMany').mockResolvedValueOnce(result);

    return request(app.getHttpServer())
      .get('/321')
      .expect(200)
      .expect([
        {
          id: '123',
          group: '321',
          meta: {
            name: 'Olavio',
          },
          updatedAt: '2022-12-11T11:33:40.343Z',
          createdAt: '2022-12-10T20:27:25.330Z',
          mongoId: 'abc',
          status: 'ACTIVE',
        },
      ]);
  });

  it('POST /:group/:id - heart beat already deleted', () => {
    const result: HeartBeat = {
      id: '123',
      group: '321',
      meta: {
        name: 'Olavio',
      },
      updatedAt: new Date('2022-12-11T11:33:40.343Z'),
      createdAt: new Date('2022-12-10T20:27:25.330Z'),
      mongoId: 'abc',
      status: 'DELETED',
    };

    jest.spyOn(database, 'heartBeatFindOne').mockResolvedValueOnce(result);

    return request(app.getHttpServer())
      .post('/321/123')
      .expect(412)
      .expect({ statusCode: 412, message: 'This heartbeat has been deleted' });
  });

  it('POST /:group/:id - create', () => {
    const result: HeartBeat = {
      id: '123',
      group: '321',
      meta: {
        name: 'Olavio',
      },
      updatedAt: new Date('2022-12-11T11:33:40.343Z'),
      createdAt: new Date('2022-12-10T20:27:25.330Z'),
      mongoId: 'abc',
      status: 'ACTIVE',
    };

    jest.spyOn(database, 'heartBeatFindOne').mockResolvedValueOnce(null);
    jest.spyOn(database, 'heartBeatUpsert').mockResolvedValueOnce(result);

    return request(app.getHttpServer())
      .post('/321/123')
      .expect(201)
      .expect({
        id: '123',
        group: '321',
        meta: {
          name: 'Olavio',
        },
        updatedAt: '2022-12-11T11:33:40.343Z',
        createdAt: '2022-12-10T20:27:25.330Z',
        mongoId: 'abc',
        status: 'ACTIVE',
      });
  });

  it('POST /:group/:id - update', () => {
    const result: HeartBeat = {
      id: '123',
      group: '321',
      meta: {
        name: 'Olavio',
      },
      updatedAt: new Date('2022-12-11T11:33:40.343Z'),
      createdAt: new Date('2022-12-10T20:27:25.330Z'),
      mongoId: 'abc',
      status: 'ACTIVE',
    };

    jest.spyOn(database, 'heartBeatFindOne').mockResolvedValueOnce(result);
    jest.spyOn(database, 'heartBeatUpsert').mockResolvedValueOnce(result);

    return request(app.getHttpServer())
      .post('/321/123')
      .expect(201)
      .expect({
        id: '123',
        group: '321',
        meta: {
          name: 'Olavio',
        },
        updatedAt: '2022-12-11T11:33:40.343Z',
        createdAt: '2022-12-10T20:27:25.330Z',
        mongoId: 'abc',
        status: 'ACTIVE',
      });
  });

  it('DELETE /:group/:id - success', () => {
    const findOne: HeartBeat = {
      id: '123',
      group: '321',
      meta: {
        name: 'Olavio',
      },
      updatedAt: new Date('2022-12-11T11:33:40.343Z'),
      createdAt: new Date('2022-12-10T20:27:25.330Z'),
      mongoId: 'abc',
      status: 'ACTIVE',
    };
    const deleted: HeartBeat = {
      id: '123',
      group: '321',
      meta: {
        name: 'Olavio',
      },
      updatedAt: new Date('2022-12-11T11:33:40.343Z'),
      createdAt: new Date('2022-12-10T20:27:25.330Z'),
      mongoId: 'abc',
      status: 'DELETED',
    };

    jest.spyOn(database, 'heartBeatFindOne').mockResolvedValueOnce(findOne);
    jest.spyOn(database, 'heartBeatUpdate').mockResolvedValueOnce(deleted);

    return request(app.getHttpServer())
      .delete('/321/123')
      .expect(200)
      .expect({
        id: '123',
        group: '321',
        meta: {
          name: 'Olavio',
        },
        updatedAt: '2022-12-11T11:33:40.343Z',
        createdAt: '2022-12-10T20:27:25.330Z',
        mongoId: 'abc',
        status: 'DELETED',
      });
  });

  it('DELETE /:group/:id - heart beat does not exist', () => {
    jest.spyOn(database, 'heartBeatFindOne').mockResolvedValueOnce(null);

    return request(app.getHttpServer())
      .delete('/321/123')
      .expect(400)
      .expect({ statusCode: 400, message: 'Invalid group or id' });
  });
});
