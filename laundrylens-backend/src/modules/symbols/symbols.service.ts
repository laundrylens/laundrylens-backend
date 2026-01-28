import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';

@Injectable()
export class SymbolsService {
  constructor(private readonly prisma: PrismaService) {}
}
