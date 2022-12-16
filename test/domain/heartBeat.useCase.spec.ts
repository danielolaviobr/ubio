import { HeartBeatController } from '@controllers/heartBeat.controller';
import { HeartBeatUseCase } from '@domain/heartBeat.useCase';
import { PrismaService } from '@infra/database/prisma.service';
import { HeartBeatJobs } from '@jobs/heartBeat.job';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { Test, TestingModule } from '@nestjs/testing';
import { HeartBeat } from '@prisma/client';
import { HeartBeatRepository } from '@repositories/heartBeat.repository';

const prismaService = new PrismaService();

describe('HeartBeatUseCase', () => {
  let module: TestingModule;
  let heartBeatUseCase: HeartBeatUseCase;
  let heartBeatRepository: HeartBeatRepository;

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

    heartBeatUseCase = module.get<HeartBeatUseCase>(HeartBeatUseCase);
    heartBeatRepository = module.get<HeartBeatRepository>(HeartBeatRepository);
  });

  afterEach(() => {
    module.close();
  });

  describe('getActive', () => {
    it('should call the repository and return the wrapped the result', async () => {
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
        .spyOn(heartBeatRepository, 'findAllActive')
        .mockResolvedValue(expected);

      const findAllActive = jest.spyOn(heartBeatRepository, 'findAllActive');

      const actual = await heartBeatUseCase.getActive();

      expect(actual).toEqual([expected, null]);
      expect(findAllActive).toHaveBeenCalledTimes(1);
    });

    it('should return a wrapped result with the thrown exception', async () => {
      const errorMessage = 'Unexpected';

      jest
        .spyOn(heartBeatRepository, 'findAllActive')
        .mockRejectedValue(new Error(errorMessage));

      const findAllActive = jest.spyOn(heartBeatRepository, 'findAllActive');

      const actual = await heartBeatUseCase.getActive();

      expect(actual).toEqual([null, new Error(errorMessage)]);
      expect(findAllActive).toHaveBeenCalledTimes(1);
    });
  });

  describe('getActiveInGroup', () => {
    it('should call the repository and return the wrapped the result', async () => {
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
        .spyOn(heartBeatRepository, 'findAllActive')
        .mockResolvedValue(expected);

      const findAllActive = jest.spyOn(heartBeatRepository, 'findAllActive');

      const actual = await heartBeatUseCase.getActiveInGroup(group);

      expect(actual).toEqual([expected, null]);
      expect(findAllActive).toHaveBeenCalledTimes(1);
      expect(findAllActive).toHaveBeenCalledWith(group);
    });

    it('should return a wrapped result with the thrown exception', async () => {
      const group = '321';
      const errorMessage = 'Unexpected';

      jest
        .spyOn(heartBeatRepository, 'findAllActive')
        .mockRejectedValue(new Error(errorMessage));

      const findAllActive = jest.spyOn(heartBeatRepository, 'findAllActive');

      const actual = await heartBeatUseCase.getActiveInGroup(group);

      expect(actual).toEqual([null, new Error(errorMessage)]);
      expect(findAllActive).toHaveBeenCalledTimes(1);
      expect(findAllActive).toHaveBeenCalledWith(group);
    });
  });

  describe('delete', () => {
    it('should call the repository and return the wrapped the result', async () => {
      const group = '321';
      const id = '123';
      const expected: HeartBeat = {
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

      jest.spyOn(heartBeatRepository, 'findOne').mockResolvedValue(expected);
      jest.spyOn(heartBeatRepository, 'softDelete').mockResolvedValue(expected);

      const softDelete = jest.spyOn(heartBeatRepository, 'softDelete');
      const findOne = jest.spyOn(heartBeatRepository, 'findOne');

      const actual = await heartBeatUseCase.delete({ id, group });

      expect(actual).toEqual([expected, null]);
      expect(softDelete).toHaveBeenCalledTimes(1);
      expect(findOne).toHaveBeenCalledTimes(1);
      expect(softDelete).toHaveBeenCalledWith({ id, group });
      expect(findOne).toHaveBeenCalledWith({ id, group });
    });

    it('should throw exception if heart beat does not exist', async () => {
      const group = '321';
      const id = '123';
      const errorMessage = 'Invalid group or id';

      jest.spyOn(heartBeatRepository, 'findOne').mockResolvedValue(null);

      const softDelete = jest.spyOn(heartBeatRepository, 'softDelete');

      const actual = await heartBeatUseCase.delete({ id, group });

      expect(actual).toEqual([
        null,
        new HttpException(errorMessage, HttpStatus.BAD_REQUEST),
      ]);
      expect(softDelete).not.toHaveBeenCalled();
    });

    it('should return a wrapped result with the thrown exception', async () => {
      const group = '321';
      const id = '123';
      const errorMessage = 'Unexpected';

      jest
        .spyOn(heartBeatRepository, 'softDelete')
        .mockRejectedValue(new Error(errorMessage));

      const softDelete = jest.spyOn(heartBeatRepository, 'softDelete');

      const actual = await heartBeatUseCase.delete({ id, group });

      expect(actual).toEqual([null, new Error(errorMessage)]);
      expect(softDelete).toHaveBeenCalledTimes(1);
      expect(softDelete).toHaveBeenCalledWith({ id, group });
    });
  });

  describe('createOrUpdate', () => {
    it('should call the repository and return the wrapped the result', async () => {
      const group = '321';
      const id = '123';
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
        .spyOn(heartBeatRepository, 'updateOrInsert')
        .mockResolvedValue(expected);

      jest.spyOn(heartBeatRepository, 'findOne').mockResolvedValue(null);

      const updateOrInsert = jest.spyOn(heartBeatRepository, 'updateOrInsert');

      const actual = await heartBeatUseCase.createOrUpdate({ id, group, meta });

      expect(actual).toEqual([expected, null]);
      expect(updateOrInsert).toHaveBeenCalledTimes(1);
      expect(updateOrInsert).toHaveBeenCalledWith({ id, group, meta });
    });

    it('should return a wrapped result with the thrown exception', async () => {
      const group = '321';
      const id = '123';
      const meta = { name: 'Olavio' };

      const errorMessage = 'Unexpected';

      jest
        .spyOn(heartBeatRepository, 'updateOrInsert')
        .mockRejectedValue(new Error(errorMessage));

      jest.spyOn(heartBeatRepository, 'findOne').mockResolvedValue(null);

      const updateOrInsert = jest.spyOn(heartBeatRepository, 'updateOrInsert');

      const actual = await heartBeatUseCase.createOrUpdate({ id, group, meta });

      expect(actual).toEqual([null, new Error(errorMessage)]);
      expect(updateOrInsert).toHaveBeenCalledTimes(1);
      expect(updateOrInsert).toHaveBeenCalledWith({ id, group, meta });
    });

    it('should return a wrapped result with an exception when heartBeat to update is deleted', async () => {
      const group = '321';
      const id = '123';
      const meta = { name: 'Olavio' };

      const errorMessage = 'This heartbeat has been deleted';

      jest.spyOn(heartBeatRepository, 'findOne').mockResolvedValue({
        id: '123',
        group: '321',
        meta: {
          name: 'Olavio',
        },
        updatedAt: new Date('2022-12-11T11:33:40.343Z'),
        createdAt: new Date('2022-12-10T20:27:25.330Z'),
        status: 'DELETED',
        mongoId: 'abc',
      });

      const updateOrInsert = jest.spyOn(heartBeatRepository, 'updateOrInsert');
      const findOne = jest.spyOn(heartBeatRepository, 'findOne');

      const actual = await heartBeatUseCase.createOrUpdate({ id, group, meta });

      expect(actual).toEqual([
        null,
        new HttpException(errorMessage, HttpStatus.PRECONDITION_FAILED),
      ]);
      expect(updateOrInsert).not.toHaveBeenCalled();
      expect(findOne).toHaveBeenCalledWith({ id, group });
    });
  });
});
