# [B-001] NestJS 프로젝트 초기화

## 개요
- 이슈: Backend 프로젝트 기본 구조 설정
- 작업 기간: 2026-01-28

## 구현 내용

### 주요 변경사항
- NestJS CLI를 사용하여 프로젝트 생성
- pnpm 패키지 매니저 사용
- TypeScript strict 모드 활성화
- 기본 테스트 환경 구성 (Jest)

### 파일 구조
```
laundrylens-backend/
├── src/
│   ├── app.controller.ts      # 기본 컨트롤러
│   ├── app.controller.spec.ts # 컨트롤러 테스트
│   ├── app.module.ts          # 루트 모듈
│   ├── app.service.ts         # 기본 서비스
│   └── main.ts                # 애플리케이션 엔트리포인트
├── test/
│   ├── app.e2e-spec.ts        # E2E 테스트
│   └── jest-e2e.json          # E2E Jest 설정
├── .prettierrc                # Prettier 설정
├── eslint.config.mjs          # ESLint 설정
├── nest-cli.json              # NestJS CLI 설정
├── package.json               # 의존성 및 스크립트
├── tsconfig.json              # TypeScript 설정
└── tsconfig.build.json        # 빌드용 TypeScript 설정
```

## 기술적 세부사항

### 사용된 기술 스택
- NestJS 11.x
- TypeScript 5.x (strict mode)
- Jest (테스트 프레임워크)
- pnpm (패키지 매니저)

### 주요 스크립트
| 스크립트 | 설명 |
|---------|------|
| `pnpm start` | 애플리케이션 실행 |
| `pnpm start:dev` | 개발 모드 (watch) |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm test` | 단위 테스트 실행 |
| `pnpm test:e2e` | E2E 테스트 실행 |
| `pnpm lint` | ESLint 검사 |

## 테스트

```bash
cd laundrylens-backend && pnpm test
```

### 테스트 케이스
- [x] AppController.root() - "Hello World!" 반환 확인

### 테스트 결과
```
PASS src/app.controller.spec.ts
  AppController
    root
      ✓ should return "Hello World!"

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
```

## 의사결정 기록

| 날짜 | 결정 사항 | 이유 | 대안 |
|------|----------|------|------|
| 2026-01-28 | pnpm 사용 | 빠른 설치, 엄격한 의존성 관리 | npm, yarn |
| 2026-01-28 | strict 모드 활성화 | 타입 안정성 강화 | 기본 모드 |

## 참고 자료
- [NestJS 공식 문서](https://docs.nestjs.com/)
- [TypeScript 공식 문서](https://www.typescriptlang.org/docs/)
