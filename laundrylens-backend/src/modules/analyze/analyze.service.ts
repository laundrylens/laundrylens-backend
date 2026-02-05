import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { OpenAIVisionService } from './services';
import {
  AnalyzeResultDto,
  DetectedSymbolDto,
  RemainingAnalysesDto,
} from './dto';

@Injectable()
export class AnalyzeService {
  private readonly logger = new Logger(AnalyzeService.name);
  private readonly DAILY_LIMIT = 5;

  constructor(
    private readonly prisma: PrismaService,
    private readonly visionService: OpenAIVisionService,
  ) {}

  async analyzeImage(
    imageBuffer: Buffer,
    guestId: string,
  ): Promise<AnalyzeResultDto> {
    // 일일 제한 확인
    const remaining = await this.getRemainingCount(guestId);
    if (remaining <= 0) {
      throw new ForbiddenException(
        '오늘의 무료 분석 횟수를 모두 사용했습니다. 내일 다시 이용해주세요.',
      );
    }

    const startTime = Date.now();

    // 이미지를 Base64로 변환
    const imageBase64 = imageBuffer.toString('base64');

    // OpenAI Vision API로 분석
    const visionResult = await this.visionService.analyzeImage(imageBase64);

    // 감지된 기호를 DB의 기호와 매칭
    const detectedSymbols = await this.matchSymbolsWithDatabase(
      visionResult.symbols,
    );

    const processingTime = Date.now() - startTime;

    // 사용량 로그 저장
    await this.logUsage(guestId);

    return {
      detectedSymbols,
      careTips: visionResult.careTips,
      processingTime,
    };
  }

  async getRemainingAnalyses(guestId: string): Promise<RemainingAnalysesDto> {
    const remaining = await this.getRemainingCount(guestId);
    const resetAt = this.getNextResetTime();

    return {
      remaining,
      dailyLimit: this.DAILY_LIMIT,
      resetAt: resetAt.toISOString(),
    };
  }

  private async getRemainingCount(guestId: string): Promise<number> {
    const todayStart = this.getTodayStart();

    const usageCount = await this.prisma.usageLog.count({
      where: {
        guestId,
        action: 'ANALYZE_IMAGE',
        createdAt: {
          gte: todayStart,
        },
      },
    });

    return Math.max(0, this.DAILY_LIMIT - usageCount);
  }

  private getTodayStart(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  private getNextResetTime(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }

  private async matchSymbolsWithDatabase(
    symbols: Array<{ code: string; confidence: number }>,
  ): Promise<DetectedSymbolDto[]> {
    const detectedSymbols: DetectedSymbolDto[] = [];

    for (const symbol of symbols) {
      const dbSymbol = await this.prisma.laundrySymbol.findUnique({
        where: { code: symbol.code },
      });

      detectedSymbols.push({
        code: symbol.code,
        confidence: symbol.confidence,
        symbolId: dbSymbol?.id,
      });
    }

    return detectedSymbols;
  }

  private async logUsage(guestId: string) {
    await this.prisma.usageLog.create({
      data: {
        guestId,
        action: 'ANALYZE_IMAGE',
      },
    });
  }
}
