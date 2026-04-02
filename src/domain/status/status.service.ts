import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

@Injectable()
export class StatusService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatus(): Promise<void> {
    await this.prisma.$queryRaw`SELECT 1`;
  }
}
