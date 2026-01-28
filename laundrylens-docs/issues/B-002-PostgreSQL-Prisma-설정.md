# [B-002] PostgreSQL + Prisma 설정

## 개요
- 이슈: 데이터베이스 ORM 설정
- 작업 기간: 2026-01-28

## 구현 내용

### 주요 변경사항
- Prisma ORM 설치 및 설정
- 전체 데이터베이스 스키마 정의 (10개 모델)
- PrismaService 및 PrismaModule 구현
- Global 모듈로 등록하여 전역 사용 가능

### 파일 구조
```
laundrylens-backend/
├── prisma/
│   └── schema.prisma          # DB 스키마 정의
├── src/
│   ├── prisma/
│   │   ├── prisma.service.ts      # Prisma 서비스
│   │   ├── prisma.service.spec.ts # 서비스 테스트
│   │   ├── prisma.module.ts       # Prisma 모듈
│   │   └── index.ts               # 배럴 익스포트
│   └── app.module.ts              # PrismaModule 임포트
├── .env                           # 환경변수 (gitignore)
└── .env.example                   # 환경변수 템플릿
```

## 기술적 세부사항

### 데이터베이스 스키마

#### Enums
| Enum | 값 |
|------|-----|
| SocialProvider | KAKAO, GOOGLE |
| PlanType | MONTHLY, CREDITS |
| SubscriptionStatus | ACTIVE, CANCELLED, EXPIRED |
| PaymentStatus | PENDING, COMPLETED, FAILED, REFUNDED |
| SymbolCategory | WASH, BLEACH, DRY, IRON, DRYCLEAN |
| Frequency | ALWAYS, OFTEN, SOMETIMES |

#### Models (10개)
| 모델 | 설명 |
|------|------|
| User | 사용자 정보 |
| SocialAccount | 소셜 로그인 연결 |
| Subscription | 구독 정보 |
| Payment | 결제 내역 |
| UsageLog | 사용 이력 |
| LaundrySymbol | 세탁기호 마스터 |
| SymbolTranslation | 기호별 다국어 번역 |
| AnalysisHistory | AI 분석 이력 |
| Material | 소재 정보 |
| MaterialSymbol | 소재-기호 관계 |

### PrismaService 특징
- `PrismaClient` 상속
- `OnModuleInit`: 앱 시작 시 DB 연결
- `OnModuleDestroy`: 앱 종료 시 DB 연결 해제
- `@Global()` 모듈로 전역 사용 가능

## 테스트

```bash
cd laundrylens-backend && pnpm test
```

### 테스트 케이스
- [x] PrismaService가 정의되어 있는지 확인
- [x] $connect 메서드 존재 확인
- [x] $disconnect 메서드 존재 확인
- [x] onModuleInit 구현 확인
- [x] onModuleDestroy 구현 확인

### 테스트 결과
```
PASS src/prisma/prisma.service.spec.ts
PASS src/app.controller.spec.ts

Test Suites: 2 passed, 2 total
Tests:       6 passed, 6 total
```

## 의사결정 기록

| 날짜 | 결정 사항 | 이유 | 대안 |
|------|----------|------|------|
| 2026-01-28 | Prisma 6.x 사용 | Prisma 7은 새로운 설정 방식으로 호환성 이슈 | Prisma 7, TypeORM |
| 2026-01-28 | @Global() 모듈 | 모든 모듈에서 PrismaService 주입 가능 | 각 모듈에서 import |
| 2026-01-28 | UUID 기본키 | 분산 시스템 확장성, 보안 | Auto-increment |

## 참고 자료
- [Prisma 공식 문서](https://www.prisma.io/docs)
- [NestJS Prisma 가이드](https://docs.nestjs.com/recipes/prisma)
