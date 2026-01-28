import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { OpenAIVisionService } from './services';
import { AnalyzeResultDto, DetectedSymbolDto } from './dto';

@Injectable()
export class AnalyzeService {
  private readonly logger = new Logger(AnalyzeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly visionService: OpenAIVisionService,
  ) {}

  async analyzeImage(
    imageBuffer: Buffer,
    userId?: string,
    guestId?: string,
  ): Promise<AnalyzeResultDto> {
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

    // 분석 이력 저장
    const history = await this.saveAnalysisHistory(
      imageBase64,
      detectedSymbols,
      userId,
      guestId,
    );

    // 사용량 로그 저장
    await this.logUsage(userId, guestId);

    return {
      detectedSymbols,
      imageUrl: history.imageUrl,
      careTips: visionResult.careTips,
      processingTime,
    };
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

  private async saveAnalysisHistory(
    imageBase64: string,
    detectedSymbols: DetectedSymbolDto[],
    userId?: string,
    guestId?: string,
  ) {
    // 실제 구현에서는 이미지를 S3 등에 업로드하고 URL을 저장
    // 여기서는 임시로 data URL 사용
    const imageUrl = `data:image/jpeg;base64,${imageBase64.slice(0, 100)}...`;

    return this.prisma.analysisHistory.create({
      data: {
        userId,
        guestId,
        imageUrl,
        result: detectedSymbols as unknown as Parameters<
          typeof this.prisma.analysisHistory.create
        >[0]['data']['result'],
      },
    });
  }

  private async logUsage(userId?: string, guestId?: string) {
    await this.prisma.usageLog.create({
      data: {
        userId,
        guestId,
        action: 'ANALYZE_IMAGE',
      },
    });
  }

  async getAnalysisHistory(userId: string) {
    return this.prisma.analysisHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }
}
