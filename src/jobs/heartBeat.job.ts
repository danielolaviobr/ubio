import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HeartBeatRepository } from '@repositories/heartBeat.repository';
import { sub } from 'date-fns';

@Injectable()
export class HeartBeatJobs {
  private readonly logger = new Logger(HeartBeatJobs.name);
  private readonly heartBeatMaxAge: Duration = { days: 1 };

  constructor(private readonly heartBeatRepository: HeartBeatRepository) {}

  @Cron(CronExpression.EVERY_HOUR)
  async staleHeartBeats() {
    this.logger.log('Cleaning stale heart beats');
    const staledHeartBeats = await this.getStaledHeartBeats(
      this.heartBeatMaxAge,
    );
    const staleAmount = staledHeartBeats.length;

    if (staleAmount === 0) {
      return this.logger.log('No stale heart beats to update');
    }
    this.logger.log(`${staledHeartBeats.length} heart beasts to be removed`);
    const staledHeartBeatIds = staledHeartBeats.map(
      (heartBeat) => heartBeat.mongoId,
    );
    const result = await this.updateHeartBeatStatus(staledHeartBeatIds);

    this.logger.log(`${result.count} heart beasts have been removed`);
    this.logger.log('Finishing heart beats cleaning');
  }

  private async getStaledHeartBeats(maxAge: Duration) {
    const now = new Date();
    const staleDate = sub(now, maxAge);
    return this.heartBeatRepository.findAllToBeStale(staleDate);
  }

  private async updateHeartBeatStatus(ids: string[]) {
    return this.heartBeatRepository.updateManyStatus({ ids, status: 'STALE' });
  }
}
