import { HeartBeatController } from '../../src/controllers/heartBeat.controller';
import { HeartBeatUseCase } from '../../src/domain/heartBeat.useCase';
import { PrismaService } from '../../src/infra/database/prisma.service';
import { HeartBeatJobs } from '../../src/jobs/heartBeat.job';
import { HeartBeatRepository } from '../../src/repositories/heartBeat.repository';
import { ScheduleModule } from '@nestjs/schedule';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';

const prismaService = new PrismaService();

describe('HeartBeatController', () => {
  let module: TestingModule;
  let heartBeatController: HeartBeatController;
  let heartBeatUseCase: HeartBeatUseCase;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [ScheduleModule.forRoot()],
      controllers: [HeartBeatController],
      providers: [
        HeartBeatRepository,
        HeartBeatUseCase,
        HeartBeatJobs,
        {
          provide: 'ORM',
          useValue: prismaService,
        },
      ],
    }).compile();

    heartBeatController = module.get<HeartBeatController>(HeartBeatController);
    heartBeatUseCase = module.get<HeartBeatUseCase>(HeartBeatUseCase);
  });

  afterEach(() => {
    module.close();
  });

  describe('GET - /', () => {
    it('should return array of heartBeats', async () => {
      const expected = [
        {
          id: '123',
          group: '321',
          meta: {
            name: 'Olavio',
          },
          updatedAt: new Date('2022-12-11T11:33:40.343Z'),
          createdAt: new Date('2022-12-10T20:27:25.330Z'),
        },
      ];

      jest
        .spyOn(heartBeatUseCase, 'getActive')
        .mockResolvedValue([expected, null]);

      const getActive = jest.spyOn(heartBeatUseCase, 'getActive');

      const actual = await heartBeatController.getAll();

      expect(actual).toEqual(expected);
      expect(getActive).toHaveBeenCalledTimes(1);
    });

    it('should throw a HttpException if the wrapped result contains an error', async () => {
      const errorMessage = 'Unexpected';

      jest
        .spyOn(heartBeatUseCase, 'getActive')
        .mockResolvedValue([null, new Error(errorMessage)]);

      const getActive = jest.spyOn(heartBeatUseCase, 'getActive');

      expect(heartBeatController.getAll()).rejects.toEqual(
        new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR),
      );
      expect(getActive).toHaveBeenCalledTimes(1);
    });

    it('should throw a HttpException equal to the one in the wrapped result', async () => {
      const errorMessage = 'Unexpected';

      jest
        .spyOn(heartBeatUseCase, 'getActive')
        .mockResolvedValue([
          null,
          new HttpException(errorMessage, HttpStatus.BAD_REQUEST),
        ]);

      const getActive = jest.spyOn(heartBeatUseCase, 'getActive');

      expect(heartBeatController.getAll()).rejects.toEqual(
        new HttpException(errorMessage, HttpStatus.BAD_REQUEST),
      );
      expect(getActive).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET - /:group', () => {
    it('should return array of heartBeats in selected group', async () => {
      const group = '321';
      const expected = [
        {
          id: '123',
          group: '321',
          meta: {
            name: 'Olavio',
          },
          updatedAt: new Date('2022-12-11T11:33:40.343Z'),
          createdAt: new Date('2022-12-10T20:27:25.330Z'),
        },
      ];

      jest
        .spyOn(heartBeatUseCase, 'getActiveInGroup')
        .mockResolvedValue([expected, null]);

      const getActiveInGroup = jest.spyOn(heartBeatUseCase, 'getActiveInGroup');

      const actual = await heartBeatController.getAllInGroup(group);

      expect(actual).toEqual(expected);
      expect(getActiveInGroup).toHaveBeenCalledTimes(1);
    });

    it('should throw a HttpException if the wrapped result contains an error', async () => {
      const group = '123';
      const errorMessage = 'Unexpected';

      jest
        .spyOn(heartBeatUseCase, 'getActiveInGroup')
        .mockResolvedValue([null, new Error(errorMessage)]);

      const getActiveInGroup = jest.spyOn(heartBeatUseCase, 'getActiveInGroup');

      expect(heartBeatController.getAllInGroup(group)).rejects.toEqual(
        new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR),
      );
      expect(getActiveInGroup).toHaveBeenCalledTimes(1);
    });

    it('should throw a HttpException equal to the one in the wrapped result', async () => {
      const group = '123';
      const errorMessage = 'Unexpected';

      jest
        .spyOn(heartBeatUseCase, 'getActiveInGroup')
        .mockResolvedValue([
          null,
          new HttpException(errorMessage, HttpStatus.BAD_REQUEST),
        ]);

      const getActiveInGroup = jest.spyOn(heartBeatUseCase, 'getActiveInGroup');

      expect(heartBeatController.getAllInGroup(group)).rejects.toEqual(
        new HttpException(errorMessage, HttpStatus.BAD_REQUEST),
      );
      expect(getActiveInGroup).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST - /:group/:id', () => {
    it('should call the creation/update of a heartbeat and return it', async () => {
      const id = '123';
      const group = '321';
      const meta = { name: 'Olavio' };

      const expected = {
        id: '123',
        group: '321',
        meta: {
          name: 'Olavio',
        },
        updatedAt: new Date('2022-12-11T11:33:40.343Z'),
        createdAt: new Date('2022-12-10T20:27:25.330Z'),
      };

      jest
        .spyOn(heartBeatUseCase, 'createOrUpdate')
        .mockResolvedValue([expected, null]);

      const createOrUpdate = jest.spyOn(heartBeatUseCase, 'createOrUpdate');

      const actual = await heartBeatController.createOrUpdate(id, group, meta);

      expect(actual).toEqual(expected);
      expect(createOrUpdate).toHaveBeenCalledTimes(1);
    });

    it('should throw a HttpException if the wrapped result contains an error', async () => {
      const id = '123';
      const group = '321';
      const meta = { name: 'Olavio' };
      const errorMessage = 'Unexpected';

      jest
        .spyOn(heartBeatUseCase, 'createOrUpdate')
        .mockResolvedValue([null, new Error(errorMessage)]);

      const createOrUpdate = jest.spyOn(heartBeatUseCase, 'createOrUpdate');

      expect(
        heartBeatController.createOrUpdate(id, group, meta),
      ).rejects.toEqual(
        new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR),
      );
      expect(createOrUpdate).toHaveBeenCalledTimes(1);
    });

    it('should throw a HttpException equal to the one in the wrapped result', async () => {
      const id = '123';
      const group = '321';
      const meta = { name: 'Olavio' };
      const errorMessage = 'Unexpected';

      jest
        .spyOn(heartBeatUseCase, 'createOrUpdate')
        .mockResolvedValue([
          null,
          new HttpException(errorMessage, HttpStatus.BAD_REQUEST),
        ]);

      const createOrUpdate = jest.spyOn(heartBeatUseCase, 'createOrUpdate');

      expect(
        heartBeatController.createOrUpdate(id, group, meta),
      ).rejects.toEqual(
        new HttpException(errorMessage, HttpStatus.BAD_REQUEST),
      );
      expect(createOrUpdate).toHaveBeenCalledTimes(1);
    });
  });

  describe('DELETE - /:group/:id', () => {
    it('should call the removal of a heartbeat and return it', async () => {
      const id = '123';
      const group = '321';

      const expected = {
        id: '123',
        group: '321',
        meta: {
          name: 'Olavio',
        },
        updatedAt: new Date('2022-12-11T11:33:40.343Z'),
        createdAt: new Date('2022-12-10T20:27:25.330Z'),
      };

      jest
        .spyOn(heartBeatUseCase, 'delete')
        .mockResolvedValue([expected, null]);

      const deleteHeartBeat = jest.spyOn(heartBeatUseCase, 'delete');

      const actual = await heartBeatController.delete(id, group);

      expect(actual).toEqual(expected);
      expect(deleteHeartBeat).toHaveBeenCalledTimes(1);
    });

    it('should throw a HttpException if the wrapped result contains an error', async () => {
      const id = '123';
      const group = '321';
      const errorMessage = 'Unexpected';

      jest
        .spyOn(heartBeatUseCase, 'delete')
        .mockResolvedValue([null, new Error(errorMessage)]);

      const deleteHeartBeat = jest.spyOn(heartBeatUseCase, 'delete');

      expect(heartBeatController.delete(id, group)).rejects.toEqual(
        new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR),
      );
      expect(deleteHeartBeat).toHaveBeenCalledTimes(1);
    });

    it('should throw a HttpException equal to the one in the wrapped result', async () => {
      const id = '123';
      const group = '321';
      const errorMessage = 'Unexpected';

      jest
        .spyOn(heartBeatUseCase, 'delete')
        .mockResolvedValue([
          null,
          new HttpException(errorMessage, HttpStatus.BAD_REQUEST),
        ]);

      const deleteHeartBeat = jest.spyOn(heartBeatUseCase, 'delete');

      expect(heartBeatController.delete(id, group)).rejects.toEqual(
        new HttpException(errorMessage, HttpStatus.BAD_REQUEST),
      );
      expect(deleteHeartBeat).toHaveBeenCalledTimes(1);
    });
  });
});
