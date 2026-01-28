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

  @ApiProperty({ description: '원본 이미지 URL' })
  imageUrl: string;

  @ApiPropertyOptional({ description: '추가 관리 팁' })
  careTips?: string;

  @ApiProperty({ description: '분석 시간 (ms)', example: 1500 })
  processingTime: number;
}

export class AnalyzeRequestDto {
  // 이미지는 multipart/form-data로 전송되므로 별도 필드 불필요
}

export class AnalysisHistoryResponseDto {
  @ApiProperty({ description: '이력 ID' })
  id: string;

  @ApiPropertyOptional({ description: '사용자 ID' })
  userId?: string | null;

  @ApiPropertyOptional({ description: '게스트 ID' })
  guestId?: string | null;

  @ApiProperty({ description: '이미지 URL' })
  imageUrl: string;

  @ApiProperty({ description: '분석 결과', type: [DetectedSymbolDto] })
  result: DetectedSymbolDto[];

  @ApiProperty({ description: '생성일시' })
  createdAt: Date;
}

export class AnalysisHistoryListResponseDto {
  @ApiProperty({
    description: '분석 이력 목록',
    type: [AnalysisHistoryResponseDto],
  })
  histories: AnalysisHistoryResponseDto[];

  @ApiProperty({ description: '총 개수' })
  total: number;
}
