import { HeartBeatRepository } from '@repositories/heartBeat.repository';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class HeartBeatUseCase {
  constructor(private readonly repository: HeartBeatRepository) {}

  async createOrUpdate({
    group,
    id,
    meta,
  }: {
    group: string;
    id: string;
    meta: {
      [key: string]: any;
    };
  }) {
    return this.wrap(async () => {
      await this.validateNotDeleted({ group, id });
      return this.repository.updateOrInsert({
        group,
        id,
        meta,
      });
    });
  }

  private async validateNotDeleted({
    group,
    id,
  }: {
    group: string;
    id: string;
  }) {
    const heartBeat = await this.repository.findOne({ group, id });
    if (heartBeat?.status === 'DELETED') {
      throw new HttpException(
        'This heartbeat has been deleted',
        HttpStatus.PRECONDITION_FAILED,
      );
    }
  }

  async getActive() {
    return this.wrap(() => this.repository.findAllActive());
  }

  async getActiveInGroup(group: string) {
    return this.wrap(() => this.repository.findAllActive(group));
  }

  async delete({ group, id }: { group: string; id: string }) {
    return this.wrap(async () => {
      const heartBeat = await this.repository.findOne({ group, id });
      if (!heartBeat)
        throw new HttpException('Invalid group or id', HttpStatus.BAD_REQUEST);
      return this.repository.softDelete({ group, id });
    });
  }

  private async wrap<T>(
    fn: () => Promise<T>,
  ): Promise<[T, null] | [null, Error]> {
    try {
      const result = await fn();
      return [result, null];
    } catch (error: any) {
      return [null, error];
    }
  }
}
