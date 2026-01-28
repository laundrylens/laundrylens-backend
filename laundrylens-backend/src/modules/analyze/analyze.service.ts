import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';

@Injectable()
export class AnalyzeService {
  constructor(private readonly prisma: PrismaService) {}
}
