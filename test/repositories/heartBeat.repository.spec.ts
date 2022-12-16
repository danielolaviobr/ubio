import { HeartBeatController } from '@controllers/heartBeat.controller';
import { HeartBeatUseCase } from '@domain/heartBeat.useCase';
import { PrismaService } from '@infra/database/prisma.service';
import { HeartBeatJobs } from '@jobs/heartBeat.job';
import { ScheduleModule } from '@nestjs/schedule';
import { TestingModule, Test } from '@nestjs/testing';
import { HeartBeatRepository } from '@repositories/heartBeat.repository';
import { ORM } from '@infra/database/ORM';
import { HeartBeat } from '@prisma/client';

const prismaService = new PrismaService();

describe('heartBeatRepository', () => {
  let module: TestingModule;
  let orm: ORM;
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
    orm = module.get<ORM>('ORM');
    heartBeatRepository = module.get<HeartBeatRepository>(HeartBeatRepository);
  });

  afterEach(() => {
    module.close();
  });

  describe('findOne', () => {
    it('should call the heartBeatfindMany method from the ORM and pass the correct params', async () => {
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
        status: 'ACTIVE',
        mongoId: 'abc',
      };

      jest.spyOn(orm, 'heartBeatFindOne').mockResolvedValue(expected);

      const heartBeatFindOne = jest.spyOn(orm, 'heartBeatFindOne');

      const actual = await heartBeatRepository.findOne({ id, group });

      expect(actual).toEqual(expected);
      expect(heartBeatFindOne).toHaveBeenCalledWith({ where: { id, group } });
    });

    it('should throw an error if orm method throw an error', async () => {
      const group = '321';
      const id = '123';
      const errorMessage = 'Unexpected';

      jest
        .spyOn(orm, 'heartBeatFindOne')
        .mockRejectedValue(new Error(errorMessage));

      expect(heartBeatRepository.findOne({ id, group })).rejects.toThrow(
        new Error(errorMessage),
      );
    });
  });

  describe('findAllActive', () => {
    it('should call the heartBeatfindMany method from the ORM without any params', async () => {
      const expected: HeartBeat[] = [
        {
          id: '123',
          group: '321',
          meta: {
            name: 'Olavio',
          },
          updatedAt: new Date('2022-12-11T11:33:40.343Z'),
          createdAt: new Date('2022-12-10T20:27:25.330Z'),
          status: 'ACTIVE',
          mongoId: 'abc',
        },
      ];

      jest.spyOn(orm, 'heartBeatfindMany').mockResolvedValue(expected);

      const heartBeatfindMany = jest.spyOn(orm, 'heartBeatfindMany');

      const actual = await heartBeatRepository.findAllActive();

      expect(actual).toEqual(expected);
      expect(heartBeatfindMany).toHaveBeenCalledWith({
        where: {
          status: 'ACTIVE',
        },
        select: {
          createdAt: true,
          group: true,
          id: true,
          meta: true,
          updatedAt: true,
        },
      });
    });

    it('should call the heartBeatfindMany method from the ORM passing the group', async () => {
      const group = '321';
      const expected: HeartBeat[] = [
        {
          id: '123',
          group: '321',
          meta: {
            name: 'Olavio',
          },
          updatedAt: new Date('2022-12-11T11:33:40.343Z'),
          createdAt: new Date('2022-12-10T20:27:25.330Z'),
          status: 'ACTIVE',
          mongoId: 'abc',
        },
      ];

      jest.spyOn(orm, 'heartBeatfindMany').mockResolvedValue(expected);

      const heartBeatfindMany = jest.spyOn(orm, 'heartBeatfindMany');

      const actual = await heartBeatRepository.findAllActive(group);

      expect(actual).toEqual(expected);
      expect(heartBeatfindMany).toHaveBeenCalledWith({
        where: {
          group,
          status: 'ACTIVE',
        },
        select: {
          createdAt: true,
          group: true,
          id: true,
          meta: true,
          updatedAt: true,
        },
      });
    });

    it('should throw an error if orm method throw an error', async () => {
      const errorMessage = 'Unexpected';

      jest
        .spyOn(orm, 'heartBeatfindMany')
        .mockRejectedValue(new Error(errorMessage));

      expect(heartBeatRepository.findAllActive()).rejects.toThrow(
        new Error(errorMessage),
      );
    });
  });

  describe('softDelete', () => {
    it('should call the heartBeatUpdate method from the ORM and update the status to DELETED', async () => {
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
        status: 'DELETED',
        mongoId: 'abc',
      };

      jest.spyOn(orm, 'heartBeatUpdate').mockResolvedValue(expected);

      const heartBeatUpdate = jest.spyOn(orm, 'heartBeatUpdate');

      const actual = await heartBeatRepository.softDelete({ id, group });

      expect(actual).toEqual(expected);
      expect(heartBeatUpdate).toHaveBeenCalledWith({
        where: {
          id_group: { id, group },
        },
        data: {
          status: 'DELETED',
        },
        select: {
          id: true,
          group: true,
          meta: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should throw an error if orm method throw an error', async () => {
      const group = '321';
      const id = '123';
      const errorMessage = 'Unexpected';

      jest
        .spyOn(orm, 'heartBeatUpdate')
        .mockRejectedValue(new Error(errorMessage));

      expect(heartBeatRepository.softDelete({ id, group })).rejects.toThrow(
        new Error(errorMessage),
      );
    });
  });

  describe('findAllToBeStale', () => {
    it('should call the heartBeatfindMany method from the ORM with an updated at lte to the selected date', async () => {
      const staleDate = new Date();
      const expected: HeartBeat[] = [
        {
          id: '123',
          group: '321',
          meta: {
            name: 'Olavio',
          },
          updatedAt: new Date('2022-12-11T11:33:40.343Z'),
          createdAt: new Date('2022-12-10T20:27:25.330Z'),
          status: 'ACTIVE',
          mongoId: 'abc',
        },
      ];

      jest.spyOn(orm, 'heartBeatfindMany').mockResolvedValue(expected);

      const heartBeatfindMany = jest.spyOn(orm, 'heartBeatfindMany');

      const actual = await heartBeatRepository.findAllToBeStale(staleDate);

      expect(actual).toEqual(expected);
      expect(heartBeatfindMany).toHaveBeenCalledWith({
        where: {
          updatedAt: {
            lte: staleDate,
          },
          status: 'ACTIVE',
        },
      });
    });

    it('should throw an error if orm method throw an error', async () => {
      const staleDate = new Date();
      const errorMessage = 'Unexpected';

      jest
        .spyOn(orm, 'heartBeatfindMany')
        .mockRejectedValue(new Error(errorMessage));

      expect(heartBeatRepository.findAllToBeStale(staleDate)).rejects.toThrow(
        new Error(errorMessage),
      );
    });
  });

  describe('updateManyStatus', () => {
    it('should call the heartBeatfindMany method from the ORM with an updated at lte to the selected date', async () => {
      const ids = ['abc'];
      const status = 'STALE';
      const expected = { count: 1 };

      jest.spyOn(orm, 'heartBeatUpdateMany').mockResolvedValue(expected);

      const heartBeatUpdateMany = jest.spyOn(orm, 'heartBeatUpdateMany');

      const actual = await heartBeatRepository.updateManyStatus({
        ids,
        status,
      });

      expect(actual).toEqual(expected);
      expect(heartBeatUpdateMany).toHaveBeenCalledWith({
        where: { mongoId: { in: ids } },
        data: { status: status },
      });
    });

    it('should throw an error if orm method throw an error', async () => {
      const ids = ['abc'];
      const status = 'STALE';
      const errorMessage = 'Unexpected';

      jest
        .spyOn(orm, 'heartBeatUpdateMany')
        .mockRejectedValue(new Error(errorMessage));

      expect(
        heartBeatRepository.updateManyStatus({ ids, status }),
      ).rejects.toThrow(new Error(errorMessage));
    });
  });

  describe('updateOrInsert', () => {
    it('should call the updateOrInsert method from the ORM with the given params', async () => {
      const id = '123';
      const group = '321';
      const meta = { name: 'Olavio' };
      const expected: HeartBeat = {
        id: '123',
        group: '321',
        meta: {
          name: 'Olavio',
        },
        updatedAt: new Date('2022-12-11T11:33:40.343Z'),
        createdAt: new Date('2022-12-10T20:27:25.330Z'),
        status: 'ACTIVE',
        mongoId: 'abc',
      };

      jest.spyOn(orm, 'heartBeatUpsert').mockResolvedValue(expected);

      const heartBeatUpsert = jest.spyOn(orm, 'heartBeatUpsert');

      const actual = await heartBeatRepository.updateOrInsert({
        id,
        group,
        meta,
      });

      expect(actual).toEqual(expected);
      expect(heartBeatUpsert).toHaveBeenCalledWith({
        where: { id_group: { group: group, id: id } },
        create: { group: group, id: id, meta: meta },
        update: { status: 'ACTIVE', meta: meta },
        select: {
          id: true,
          group: true,
          meta: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should throw an error if orm method throw an error', async () => {
      const id = '123';
      const group = '321';
      const meta = { name: 'Olavio' };
      const errorMessage = 'Unexpected';

      jest
        .spyOn(orm, 'heartBeatUpsert')
        .mockRejectedValue(new Error(errorMessage));

      expect(
        heartBeatRepository.updateOrInsert({ id, group, meta }),
      ).rejects.toThrow(new Error(errorMessage));
    });
  });
});
