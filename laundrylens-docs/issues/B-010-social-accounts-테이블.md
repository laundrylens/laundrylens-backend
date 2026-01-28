# [B-010] social_accounts 테이블

## 개요
- 이슈: Provider 패턴 테이블
- 작업 기간: 2026-01-28

## 구현 내용

### 주요 변경사항
- B-009에서 이미 구현 완료
- SocialAccount 모델 및 관련 메서드 포함

### Prisma 스키마 (SocialAccount)
```prisma
model SocialAccount {
  id           String         @id @default(uuid())
  userId       String         @map("user_id")
  provider     SocialProvider
  providerId   String         @map("provider_id")
  accessToken  String?        @map("access_token")
  refreshToken String?        @map("refresh_token")
  createdAt    DateTime       @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerId])
  @@map("social_accounts")
}

enum SocialProvider {
  KAKAO
  GOOGLE
}
```

## 기술적 세부사항

### UsersService 소셜 계정 메서드
| 메서드 | 설명 |
|--------|------|
| `findBySocialAccount` | 소셜 Provider/ProviderId로 사용자 조회 |
| `createWithSocialAccount` | 소셜 계정과 함께 사용자 생성 |
| `linkSocialAccount` | 기존 사용자에 소셜 계정 연결 |
| `updateSocialAccountTokens` | 소셜 계정 토큰 업데이트 |
| `unlinkSocialAccount` | 소셜 계정 연결 해제 |

## 테스트

```bash
cd laundrylens-backend && pnpm test
```

## 참고 자료
- [Prisma Relations](https://www.prisma.io/docs/concepts/components/prisma-schema/relations)
