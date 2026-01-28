import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SymbolCategory } from '@prisma/client';

export class SymbolQueryDto {
  @ApiPropertyOptional({
    description: '카테고리 필터',
    enum: SymbolCategory,
  })
  @IsEnum(SymbolCategory)
  @IsOptional()
  category?: SymbolCategory;

  @ApiPropertyOptional({
    description: '언어 코드',
    example: 'ko',
    default: 'ko',
  })
  @IsString()
  @IsOptional()
  lang?: string;
}
