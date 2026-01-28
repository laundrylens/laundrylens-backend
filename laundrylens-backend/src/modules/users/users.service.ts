import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
}
