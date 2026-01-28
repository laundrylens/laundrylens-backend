import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SymbolCategory } from '@prisma/client';

export class SymbolTranslationDto {
  @ApiProperty({ description: '번역 ID' })
  id: string;

  @ApiProperty({ description: '국가 코드', example: 'ko' })
  countryCode: string;

  @ApiProperty({ description: '기호 이름', example: '물세탁 가능' })
  name: string;

  @ApiProperty({ description: '짧은 설명', example: '물로 세탁할 수 있습니다' })
  shortDesc: string;

  @ApiProperty({
    description: '상세 설명',
    example: '일반 세탁기 사용 가능, 30도 이하 권장',
  })
  detailDesc: string;
}

export class SymbolResponseDto {
  @ApiProperty({ description: '기호 ID' })
  id: string;

  @ApiProperty({
    description: '기호 카테고리',
    enum: SymbolCategory,
    example: 'WASH',
  })
  category: SymbolCategory;

  @ApiProperty({ description: '기호 코드', example: 'WASH_NORMAL' })
  code: string;

  @ApiPropertyOptional({ description: '아이콘 URL' })
  iconUrl: string | null;

  @ApiProperty({ description: '생성일' })
  createdAt: Date;
}

export class SymbolDetailResponseDto extends SymbolResponseDto {
  @ApiProperty({ description: '번역 정보', type: [SymbolTranslationDto] })
  translations: SymbolTranslationDto[];
}

export class SymbolListResponseDto {
  @ApiProperty({ description: '기호 목록', type: [SymbolResponseDto] })
  symbols: SymbolResponseDto[];

  @ApiProperty({ description: '총 개수' })
  total: number;
}
