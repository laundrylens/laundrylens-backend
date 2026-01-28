import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '홍길동' })
  @IsString()
  nickname: string;

  @ApiPropertyOptional({ example: 'https://example.com/profile.jpg' })
  @IsString()
  @IsOptional()
  profileImage?: string;
}
