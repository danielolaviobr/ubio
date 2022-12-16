import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';

import { HeartBeatModule } from '@modules/heartBeat.module';
import { LoggerMiddleware } from '@infra/middleware/logging.middleware';

@Module({
  imports: [HeartBeatModule],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
