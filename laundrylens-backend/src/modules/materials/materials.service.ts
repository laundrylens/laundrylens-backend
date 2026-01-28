import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';

@Injectable()
export class MaterialsService {
  constructor(private readonly prisma: PrismaService) {}
}
