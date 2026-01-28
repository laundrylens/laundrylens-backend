import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService) {}
}
