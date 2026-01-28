import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma';
import { configuration, validate } from './config';
import { AuthModule } from './modules/auth';
import { UsersModule } from './modules/users';
import { SymbolsModule } from './modules/symbols';
import { MaterialsModule } from './modules/materials';
import { AnalyzeModule } from './modules/analyze';
import { PaymentModule } from './modules/payment';
import { SubscriptionModule } from './modules/subscription';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    SymbolsModule,
    MaterialsModule,
    AnalyzeModule,
    PaymentModule,
    SubscriptionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
