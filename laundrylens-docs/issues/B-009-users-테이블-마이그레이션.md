# [B-009] users 테이블 마이그레이션

## 개요
- 이슈: Prisma 스키마 작성 및 마이그레이션
- 작업 기간: 2026-01-28

## 구현 내용

### 주요 변경사항
- UsersService 구현 (CRUD 및 소셜 계정 관리)
- User DTOs (CreateUserDto, UpdateUserDto)
- UsersService 단위 테스트

### 파일 구조
```
src/modules/users/
├── dto/
│   ├── index.ts
│   ├── create-user.dto.ts
│   └── update-user.dto.ts
├── users.module.ts
├── users.service.ts
├── users.service.spec.ts
├── users.controller.ts
└── index.ts
```

## 기술적 세부사항

### UsersService 메서드
| 메서드 | 설명 |
|--------|------|
| `create` | 새 사용자 생성 |
| `findById` | ID로 사용자 조회 |
| `findByIdOrThrow` | ID로 사용자 조회 (없으면 예외) |
| `findByEmail` | 이메일로 사용자 조회 |
| `findBySocialAccount` | 소셜 계정으로 사용자 조회 |
| `createWithSocialAccount` | 소셜 계정과 함께 사용자 생성 |
| `linkSocialAccount` | 기존 사용자에 소셜 계정 연결 |
| `updateSocialAccountTokens` | 소셜 계정 토큰 업데이트 |
| `update` | 사용자 정보 수정 |
| `softDelete` | 사용자 소프트 삭제 |
| `unlinkSocialAccount` | 소셜 계정 연결 해제 |

### Prisma 스키마 (User)
```prisma
model User {
  id           String    @id @default(uuid())
  email        String?   @unique
  nickname     String
  profileImage String?   @map("profile_image")
  isPremium    Boolean   @default(false) @map("is_premium")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  deletedAt    DateTime? @map("deleted_at")

  socialAccounts    SocialAccount[]
  // ... relations
  @@map("users")
}
```

## 테스트

```bash
cd laundrylens-backend && pnpm test
```

### 테스트 케이스
- [x] create - 사용자 생성
- [x] findById - ID로 사용자 조회
- [x] findByIdOrThrow - 사용자 없을 때 예외 발생
- [x] findByEmail - 이메일로 사용자 조회
- [x] findBySocialAccount - 소셜 계정으로 사용자 조회
- [x] createWithSocialAccount - 소셜 계정과 함께 사용자 생성
- [x] update - 사용자 정보 수정
- [x] softDelete - 소프트 삭제
- [x] linkSocialAccount - 소셜 계정 연결
- [x] unlinkSocialAccount - 소셜 계정 연결 해제

## 참고 자료
- [Prisma CRUD](https://www.prisma.io/docs/concepts/components/prisma-client/crud)
