import { ORM } from '@infra/database/ORM';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { HeartBeat, Status } from '@prisma/client';

@Injectable()
export class HeartBeatRepository {
  private readonly logger = new Logger(HeartBeatRepository.name);

  constructor(@Inject('ORM') private readonly collection: ORM) {}

  async updateOrInsert(data: {
    group: string;
    id: string;
    meta: { [key: string]: any };
  }) {
    return this.collection.heartBeatUpsert({
      where: { id_group: { group: data.group, id: data.id } },
      create: { group: data.group, id: data.id, meta: data.meta },
      update: { status: 'ACTIVE', meta: data.meta },
      select: {
        id: true,
        group: true,
        meta: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne({ group, id }: { group: string; id: string }) {
    return this.collection.heartBeatFindOne({
      where: {
        group,
        id,
      },
    });
  }

  async findAllActive(group?: string) {
    return this.collection.heartBeatfindMany({
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
  }

  async softDelete({ id, group }: { group: string; id: string }) {
    this.logger.log(
      `Soft deleting the heart beat with id: ${id} and in the group: ${group}`,
    );
    return this.collection.heartBeatUpdate({
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
  }

  async findAllToBeStale(staleDate: Date) {
    return this.collection.heartBeatfindMany({
      where: {
        updatedAt: {
          lte: staleDate,
        },
        status: 'ACTIVE',
      },
    });
  }

  async updateManyStatus(data: { ids: string[]; status: Status }) {
    this.logger.log(
      `Updating the status of the heart beats with the following mongo ids: [${data.ids.join(
        ',',
      )}]`,
    );
    return this.collection.heartBeatUpdateMany({
      where: { mongoId: { in: data.ids } },
      data: { status: data.status },
    });
  }
}
