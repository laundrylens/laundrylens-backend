import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma';
import { configuration, validate } from './config';
import { SymbolsModule } from './modules/symbols';
import { MaterialsModule } from './modules/materials';
import { AnalyzeModule } from './modules/analyze';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
    SymbolsModule,
    MaterialsModule,
    AnalyzeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
