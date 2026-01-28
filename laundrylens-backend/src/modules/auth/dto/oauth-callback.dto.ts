import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OAuthCallbackDto {
  @ApiProperty({ description: 'OAuth 인가 코드' })
  @IsString()
  code: string;
}
