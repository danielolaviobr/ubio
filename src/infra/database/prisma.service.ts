import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { ORM } from '@infra/database/ORM';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, ORM {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }

  heartBeatfindMany<T extends Prisma.HeartBeatFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.HeartBeatFindManyArgs>,
  ) {
    return this.heartBeat.findMany(args);
  }

  heartBeatUpsert<T extends Prisma.HeartBeatUpsertArgs>(
    args: Prisma.SelectSubset<T, Prisma.HeartBeatUpsertArgs>,
  ) {
    return this.heartBeat.upsert(args);
  }

  heartBeatUpdateMany<T extends Prisma.HeartBeatUpdateManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.HeartBeatUpdateManyArgs>,
  ) {
    return this.heartBeat.updateMany(args);
  }

  heartBeatUpdate<T extends Prisma.HeartBeatUpdateArgs>(
    args: Prisma.SelectSubset<T, Prisma.HeartBeatUpdateArgs>,
  ) {
    return this.heartBeat.update(args);
  }

  heartBeatFindOne<T extends Prisma.HeartBeatFindFirstArgs>(
    args: Prisma.SelectSubset<T, Prisma.HeartBeatFindFirstArgs>,
  ) {
    return this.heartBeat.findFirst(args);
  }
}
