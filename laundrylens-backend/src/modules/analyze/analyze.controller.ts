import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { AnalyzeService } from './analyze.service';
import { AnalyzeResultDto } from './dto';
import { JwtAuthGuard, CurrentUser, Public } from '../auth';

@ApiTags('analyze')
@Controller('analyze')
export class AnalyzeController {
  constructor(private readonly analyzeService: AnalyzeService) {}

  @Public()
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
  @ApiOperation({ summary: '세탁 라벨 이미지 분석' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: '분석할 이미지 파일',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '분석 성공',
    type: AnalyzeResultDto,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async analyze(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<AnalyzeResultDto> {
    if (!file) {
      throw new BadRequestException('이미지 파일이 필요합니다.');
    }

    return this.analyzeService.analyzeImage(file.buffer);
  }

  @Post('authenticated')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: 5 * 1024 * 1024 },
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
  @ApiBearerAuth()
  @ApiOperation({ summary: '세탁 라벨 이미지 분석 (인증된 사용자)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '분석 성공',
    type: AnalyzeResultDto,
  })
  @ApiResponse({ status: 401, description: '인증 필요' })
  async analyzeAuthenticated(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ): Promise<AnalyzeResultDto> {
    if (!file) {
      throw new BadRequestException('이미지 파일이 필요합니다.');
    }

    return this.analyzeService.analyzeImage(file.buffer, user.id);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '분석 이력 조회' })
  @ApiResponse({ status: 200, description: '이력 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  async getHistory(@CurrentUser() user: User) {
    return this.analyzeService.getAnalysisHistory(user.id);
  }
}
