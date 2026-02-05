import {
  Controller,
  Post,
  Get,
  Headers,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { AnalyzeService } from './analyze.service';
import { AnalyzeResultDto, RemainingAnalysesDto } from './dto';

@ApiTags('analyze')
@Controller('analyze')
export class AnalyzeController {
  constructor(private readonly analyzeService: AnalyzeService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          cb(
            new BadRequestException('이미지 파일만 업로드 가능합니다.'),
            false,
          );
          return;
        }
        cb(null, true);
      },
    }),
  )
  @ApiOperation({
    summary: '세탁 라벨 이미지 분석',
    description: '이미지를 업로드하여 세탁 기호를 분석합니다. 일일 5회 무료',
  })
  @ApiHeader({
    name: 'x-guest-id',
    description: '게스트 식별자 (클라이언트에서 생성한 UUID)',
    required: true,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: '분석할 이미지 파일 (최대 5MB)',
        },
      },
      required: ['image'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '분석 성공',
    type: AnalyzeResultDto,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 (이미지 없음)' })
  @ApiResponse({ status: 403, description: '일일 분석 횟수 초과' })
  async analyze(
    @UploadedFile() file: Express.Multer.File,
    @Headers('x-guest-id') guestId: string,
  ): Promise<AnalyzeResultDto> {
    if (!file) {
      throw new BadRequestException('이미지 파일이 필요합니다.');
    }

    if (!guestId) {
      throw new BadRequestException('x-guest-id 헤더가 필요합니다.');
    }

    return this.analyzeService.analyzeImage(file.buffer, guestId);
  }

  @Get('remaining')
  @ApiOperation({
    summary: '남은 분석 횟수 조회',
    description: '오늘 남은 무료 분석 횟수를 조회합니다.',
  })
  @ApiHeader({
    name: 'x-guest-id',
    description: '게스트 식별자 (클라이언트에서 생성한 UUID)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: RemainingAnalysesDto,
  })
  @ApiResponse({ status: 400, description: 'x-guest-id 헤더 없음' })
  async getRemaining(
    @Headers('x-guest-id') guestId: string,
  ): Promise<RemainingAnalysesDto> {
    if (!guestId) {
      throw new BadRequestException('x-guest-id 헤더가 필요합니다.');
    }

    return this.analyzeService.getRemainingAnalyses(guestId);
  }
}
