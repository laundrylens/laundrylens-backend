import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: '새 닉네임' })
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiPropertyOptional({ example: 'https://example.com/new-profile.jpg' })
  @IsString()
  @IsOptional()
  profileImage?: string;
}
