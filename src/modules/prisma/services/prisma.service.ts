import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common";
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super();
  }
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    // optional and better for performance, because of prisma client lazy connect behavior
    // https://github.com/fivethree-team/nestjs-prisma-starter/issues/438

    this.logger.log("Prisma connected to database")
    await this.$connect();
  }

  async onModuleDestroy() {
    this.logger.warn("Prisma disconnected from database")
    await this.$disconnect();
  }
}
