import { ApiProperty } from '@nestjs/swagger';

export class CountryDto {
  @ApiProperty({ description: '국가 코드', example: 'ko' })
  code: string;

  @ApiProperty({ description: '국가명 (한국어)', example: '한국어' })
  nameKo: string;

  @ApiProperty({ description: '국가명 (영어)', example: 'Korean' })
  nameEn: string;
}

export class CountryListResponseDto {
  @ApiProperty({ description: '지원 국가 목록', type: [CountryDto] })
  countries: CountryDto[];
}
