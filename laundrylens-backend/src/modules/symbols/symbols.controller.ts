import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SymbolsService } from './symbols.service';
import {
  SymbolQueryDto,
  SymbolListResponseDto,
  SymbolDetailResponseDto,
} from './dto';

@ApiTags('symbols')
@Controller('symbols')
export class SymbolsController {
  constructor(private readonly symbolsService: SymbolsService) {}

  @Get()
  @ApiOperation({ summary: '세탁 기호 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '기호 목록 조회 성공',
    type: SymbolListResponseDto,
  })
  async findAll(
    @Query() query: SymbolQueryDto,
  ): Promise<SymbolListResponseDto> {
    return this.symbolsService.findAll(query.category);
  }

  @Get(':id')
  @ApiOperation({ summary: '세탁 기호 상세 조회' })
  @ApiParam({ name: 'id', description: '기호 ID' })
  @ApiResponse({
    status: 200,
    description: '기호 상세 조회 성공',
    type: SymbolDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: '기호를 찾을 수 없음' })
  async findOne(
    @Param('id') id: string,
    @Query('lang') lang?: string,
  ): Promise<SymbolDetailResponseDto> {
    return this.symbolsService.findById(id, lang);
  }
}
