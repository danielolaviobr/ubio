import { Prisma, PrismaPromise } from '@prisma/client';

export interface ORM {
  heartBeatfindMany<T extends Prisma.HeartBeatFindManyArgs>(
    args?: Prisma.SelectSubset<T, Prisma.HeartBeatFindManyArgs>,
  ): PrismaPromise<Array<Prisma.HeartBeatGetPayload<T>>>;
  heartBeatUpsert<T extends Prisma.HeartBeatUpsertArgs>(
    args: Prisma.SelectSubset<T, Prisma.HeartBeatUpsertArgs>,
  ): Prisma.Prisma__HeartBeatClient<Prisma.HeartBeatGetPayload<T>>;
  heartBeatUpdateMany<T extends Prisma.HeartBeatUpdateManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.HeartBeatUpdateManyArgs>,
  ): PrismaPromise<Prisma.BatchPayload>;
  heartBeatUpdate<T extends Prisma.HeartBeatUpdateArgs>(
    args: Prisma.SelectSubset<T, Prisma.HeartBeatUpdateArgs>,
  ): Prisma.Prisma__HeartBeatClient<Prisma.HeartBeatGetPayload<T>>;
  heartBeatFindOne<T extends Prisma.HeartBeatFindFirstArgs>(
    args: Prisma.SelectSubset<T, Prisma.HeartBeatFindFirstArgs>,
  ): Prisma.Prisma__HeartBeatClient<Prisma.HeartBeatGetPayload<T> | null, null>;
}
