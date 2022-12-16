import { HeartBeatController } from '@controllers/heartBeat.controller';
import { HeartBeatUseCase } from '@domain/heartBeat.useCase';
import { PrismaService } from '@infra/database/prisma.service';
import { HeartBeatJobs } from '@jobs/heartBeat.job';
import { ScheduleModule } from '@nestjs/schedule';
import { TestingModule, Test } from '@nestjs/testing';
import { HeartBeat } from '@prisma/client';
import { HeartBeatRepository } from '@repositories/heartBeat.repository';

const prismaService = new PrismaService();

describe('HeartBeatJobs', () => {
  let module: TestingModule;
  let heartBeatRepository: HeartBeatRepository;
  let heartBeatJobs: HeartBeatJobs;

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
    heartBeatJobs = module.get<HeartBeatJobs>(HeartBeatJobs);
    heartBeatRepository = module.get<HeartBeatRepository>(HeartBeatRepository);
  });

  afterEach(() => {
    module.close();
  });

  describe('staleHeartBeats', () => {
    beforeAll(() => {
      jest.useFakeTimers().setSystemTime(new Date('2022-12-15'));
    });
    it('should stale heart beats older with updated date older than 1 day', async () => {
      const findAllToBeStaleResult: HeartBeat[] = [
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
      const updateManyStatusResult = { count: 1 };

      jest
        .spyOn(heartBeatRepository, 'findAllToBeStale')
        .mockResolvedValue(findAllToBeStaleResult);

      jest
        .spyOn(heartBeatRepository, 'updateManyStatus')
        .mockResolvedValue(updateManyStatusResult);

      const findAllToBeStale = jest.spyOn(
        heartBeatRepository,
        'findAllToBeStale',
      );

      const updateManyStatus = jest.spyOn(
        heartBeatRepository,
        'updateManyStatus',
      );

      await heartBeatJobs.staleHeartBeats();

      expect(findAllToBeStale).toHaveBeenCalledWith(new Date('2022-12-14'));
      expect(updateManyStatus).toHaveBeenCalledWith({
        ids: ['abc'],
        status: 'STALE',
      });
    });

    it('should not try to stale heart beats if there are no heart beats to stale', async () => {
      const findAllToBeStaleResult: HeartBeat[] = [];

      jest
        .spyOn(heartBeatRepository, 'findAllToBeStale')
        .mockResolvedValue(findAllToBeStaleResult);

      const findAllToBeStale = jest.spyOn(
        heartBeatRepository,
        'findAllToBeStale',
      );

      const updateManyStatus = jest.spyOn(
        heartBeatRepository,
        'updateManyStatus',
      );

      await heartBeatJobs.staleHeartBeats();

      expect(findAllToBeStale).toHaveBeenCalledWith(new Date('2022-12-14'));
      expect(updateManyStatus).not.toHaveBeenCalled();
    });
  });
});
