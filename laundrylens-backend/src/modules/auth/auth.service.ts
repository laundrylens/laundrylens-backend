import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}
}
