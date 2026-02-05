import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DetectedSymbolDto {
  @ApiProperty({ description: '기호 코드', example: 'WASH_30' })
  code: string;

  @ApiProperty({ description: '신뢰도 (0-1)', example: 0.95 })
  confidence: number;

  @ApiPropertyOptional({ description: '기호 ID (DB 매칭 시)' })
  symbolId?: string;
}

export class AnalyzeResultDto {
  @ApiProperty({
    description: '감지된 세탁 기호 목록',
    type: [DetectedSymbolDto],
  })
  detectedSymbols: DetectedSymbolDto[];

  @ApiPropertyOptional({ description: '추가 관리 팁' })
  careTips?: string;

  @ApiProperty({ description: '분석 시간 (ms)', example: 1500 })
  processingTime: number;
}

export class RemainingAnalysesDto {
  @ApiProperty({ description: '남은 분석 횟수', example: 3 })
  remaining: number;

  @ApiProperty({ description: '일일 최대 분석 횟수', example: 5 })
  dailyLimit: number;

  @ApiProperty({ description: '다음 리셋 시간 (ISO 8601)' })
  resetAt: string;
}
