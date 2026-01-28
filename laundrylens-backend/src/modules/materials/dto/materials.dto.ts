import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { Frequency } from '@prisma/client';

export class MaterialQueryDto {
  @ApiPropertyOptional({ description: '검색 키워드 (소재명)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}

export class MaterialSymbolDto {
  @ApiProperty({ description: '세탁 기호 ID' })
  symbolId: string;

  @ApiProperty({ description: '세탁 기호 코드' })
  code: string;

  @ApiPropertyOptional({ description: '세탁 기호 아이콘 URL' })
  iconUrl: string | null;

  @ApiProperty({ description: '세탁 기호 카테고리' })
  category: string;

  @ApiProperty({ description: '적용 빈도', enum: Frequency })
  frequency: Frequency;

  @ApiPropertyOptional({ description: '주의사항' })
  note: string | null;
}

export class MaterialResponseDto {
  @ApiProperty({ description: '소재 ID' })
  id: string;

  @ApiProperty({ description: '소재 코드' })
  code: string;

  @ApiProperty({ description: '소재명 (한국어)' })
  nameKo: string;

  @ApiProperty({ description: '소재명 (영어)' })
  nameEn: string;

  @ApiProperty({ description: '소재명 (일본어)' })
  nameJp: string;

  @ApiPropertyOptional({ description: '소재 설명' })
  description: string | null;

  @ApiPropertyOptional({ description: '관리 팁' })
  careTips: string | null;

  @ApiProperty({ description: '생성일' })
  createdAt: Date;
}

export class MaterialDetailResponseDto extends MaterialResponseDto {
  @ApiProperty({
    description: '연관 세탁 기호 목록',
    type: [MaterialSymbolDto],
  })
  symbols: MaterialSymbolDto[];
}

export class MaterialListResponseDto {
  @ApiProperty({ description: '소재 목록', type: [MaterialResponseDto] })
  materials: MaterialResponseDto[];

  @ApiProperty({ description: '총 개수' })
  total: number;
}
