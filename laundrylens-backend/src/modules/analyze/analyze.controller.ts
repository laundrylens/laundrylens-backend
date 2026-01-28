import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AnalyzeService } from './analyze.service';

@ApiTags('analyze')
@Controller('analyze')
export class AnalyzeController {
  constructor(private readonly analyzeService: AnalyzeService) {}
}
