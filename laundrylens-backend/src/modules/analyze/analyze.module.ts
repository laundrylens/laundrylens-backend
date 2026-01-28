import { Module } from '@nestjs/common';
import { AnalyzeController } from './analyze.controller';
import { AnalyzeService } from './analyze.service';
import { OpenAIVisionService } from './services';

@Module({
  controllers: [AnalyzeController],
  providers: [AnalyzeService, OpenAIVisionService],
  exports: [AnalyzeService],
})
export class AnalyzeModule {}
