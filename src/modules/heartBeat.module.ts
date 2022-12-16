import { HeartBeatUseCase } from '@domain/heartBeat.useCase';
import { PrismaService } from '@infra/database/prisma.service';
import { HeartBeatJobs } from '@jobs/heartBeat.job';
import { HeartBeatRepository } from '@repositories/heartBeat.repository';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { HeartBeatController } from '@controllers/heartBeat.controller';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [HeartBeatController],
  providers: [
    HeartBeatRepository,
    HeartBeatUseCase,
    HeartBeatJobs,
    {
      provide: 'ORM',
      useValue: new PrismaService(),
    },
  ],
})
export class HeartBeatModule {}
