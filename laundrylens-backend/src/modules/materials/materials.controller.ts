import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { MaterialsService } from './materials.service';
import {
  MaterialDetailResponseDto,
  MaterialListResponseDto,
  MaterialQueryDto,
} from './dto';

@ApiTags('materials')
@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Get()
  @ApiOperation({
    summary: '소재 목록 조회',
    description: '모든 소재 목록을 조회합니다.',
  })
  @ApiQuery({ name: 'search', required: false, description: '검색 키워드' })
  @ApiResponse({
    status: 200,
    description: '소재 목록 조회 성공',
    type: MaterialListResponseDto,
  })
  async findAll(
    @Query() query: MaterialQueryDto,
  ): Promise<MaterialListResponseDto> {
    return this.materialsService.findAll(query.search);
  }

  @Get('search')
  @ApiOperation({
    summary: '소재 검색',
    description: '키워드로 소재를 검색합니다.',
  })
  @ApiQuery({ name: 'q', required: true, description: '검색 키워드' })
  @ApiResponse({
    status: 200,
    description: '소재 검색 성공',
    type: MaterialListResponseDto,
  })
  async search(@Query('q') query: string): Promise<MaterialListResponseDto> {
    return this.materialsService.search(query || '');
  }

  @Get(':id')
  @ApiOperation({
    summary: '소재 상세 조회',
    description: '특정 소재의 상세 정보를 조회합니다.',
  })
  @ApiParam({ name: 'id', description: '소재 ID' })
  @ApiResponse({
    status: 200,
    description: '소재 상세 조회 성공',
    type: MaterialDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: '소재를 찾을 수 없음' })
  async findById(@Param('id') id: string): Promise<MaterialDetailResponseDto> {
    return this.materialsService.findById(id);
  }
}
