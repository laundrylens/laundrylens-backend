import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface VisionAnalysisResult {
  symbols: Array<{
    code: string;
    confidence: number;
  }>;
  careTips?: string;
}

@Injectable()
export class OpenAIVisionService {
  private readonly logger = new Logger(OpenAIVisionService.name);
  private readonly openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('openai.apiKey'),
    });
  }

  async analyzeImage(imageBase64: string): Promise<VisionAnalysisResult> {
    const prompt = this.buildPrompt();

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                  detail: 'high',
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('OpenAI 응답이 비어있습니다.');
      }

      return this.parseResponse(content);
    } catch (error) {
      this.logger.error('이미지 분석 실패:', error);
      throw error;
    }
  }

  private buildPrompt(): string {
    return `당신은 세탁 케어 라벨 분석 전문가입니다.
이미지에서 세탁 기호를 찾아 분석해주세요.

다음 카테고리의 기호를 찾아주세요:
1. WASH (세탁): WASH_95, WASH_60, WASH_40, WASH_30, WASH_HAND, WASH_NO
2. BLEACH (표백): BLEACH_ANY, BLEACH_OXYGEN, BLEACH_NO
3. DRY (건조): DRY_TUMBLE_HIGH, DRY_TUMBLE_LOW, DRY_TUMBLE_NO, DRY_LINE, DRY_FLAT
4. IRON (다림질): IRON_HIGH, IRON_MEDIUM, IRON_LOW, IRON_NO
5. DRYCLEAN (드라이클리닝): DRYCLEAN_ANY, DRYCLEAN_P, DRYCLEAN_F, DRYCLEAN_NO

JSON 형식으로 응답해주세요:
{
  "symbols": [
    { "code": "기호코드", "confidence": 0.0~1.0 }
  ],
  "careTips": "추가적인 관리 팁 (선택사항)"
}

기호가 발견되지 않으면 빈 배열을 반환하세요.
confidence는 0.7 이상인 기호만 포함하세요.`;
  }

  private parseResponse(content: string): VisionAnalysisResult {
    try {
      const parsed = JSON.parse(content) as {
        symbols?: Array<{ code: string; confidence: number }>;
        careTips?: string;
      };

      return {
        symbols: parsed.symbols || [],
        careTips: parsed.careTips,
      };
    } catch {
      this.logger.error('응답 파싱 실패:', content);
      return { symbols: [] };
    }
  }
}
