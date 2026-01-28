import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}
}
