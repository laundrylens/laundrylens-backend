import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have $connect method', () => {
    expect(service).toHaveProperty('$connect');
  });

  it('should have $disconnect method', () => {
    expect(service).toHaveProperty('$disconnect');
  });

  it('should implement onModuleInit', () => {
    expect(service).toHaveProperty('onModuleInit');
  });

  it('should implement onModuleDestroy', () => {
    expect(service).toHaveProperty('onModuleDestroy');
  });
});
