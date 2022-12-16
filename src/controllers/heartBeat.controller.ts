import { HeartBeatUseCase } from '@domain/heartBeat.useCase';
import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Delete,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HeartBeat } from '@prisma/client';

@Controller()
export class HeartBeatController {
  private readonly logger = new Logger(HeartBeatController.name);
  constructor(private readonly useCase: HeartBeatUseCase) {}

  @Get('/')
  async getAll(): Promise<Partial<HeartBeat>[]> {
    return this.unwrap(() => this.useCase.getActive());
  }

  @Get('/:group')
  async getAllInGroup(
    @Param('group') group: string,
  ): Promise<Partial<HeartBeat>[]> {
    return this.unwrap(() => this.useCase.getActiveInGroup(group));
  }

  @Post('/:group/:id')
  async createOrUpdate(
    @Param('id') id: string,
    @Param('group') group: string,
    @Body('meta') meta: any,
  ) {
    return this.unwrap(() =>
      this.useCase.createOrUpdate({
        group,
        id,
        meta,
      }),
    );
  }

  @Delete('/:group/:id')
  async delete(@Param('group') group: string, @Param('id') id: string) {
    return this.unwrap(() => this.useCase.delete({ group, id }));
  }

  private async unwrap<T>(
    fn: () => Promise<[T, null] | [null, Error]>,
  ): Promise<T> {
    const [result, error] = await fn();

    if (error) {
      this.logger.error(error, error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return result;
  }
}
