import { Test, TestingModule } from '@nestjs/testing';
import { StatusService } from './status.service';
import { PrismaService } from '../../infra/database/prisma.service';

describe('StatusService', () => {
  let service: StatusService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatusService,
        {
          provide: PrismaService,
          useValue: { $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]) },
        },
      ],
    }).compile();

    service = module.get(StatusService);
    prisma = module.get(PrismaService);
  });

  it('should call prisma.$queryRaw', async () => {
    await service.getStatus();
    expect(prisma.$queryRaw).toHaveBeenCalled();
  });

  it('should resolve without throwing', async () => {
    await expect(service.getStatus()).resolves.toBeUndefined();
  });
});
