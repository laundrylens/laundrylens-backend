# [B-006] Logging Interceptor

## 개요
- 이슈: 요청/응답 로깅 인터셉터 구현
- 작업 기간: 2026-01-28

## 구현 내용

### 주요 변경사항
- LoggingInterceptor 구현
- 요청 시작/완료 시 로그 출력
- 응답 시간 측정

### 파일 구조
```
src/common/
├── interceptors/
│   ├── logging.interceptor.ts
│   ├── logging.interceptor.spec.ts
│   └── index.ts
└── index.ts
```

## 기술적 세부사항

### 로그 형식
```
[LoggingInterceptor] [GET] /api/users - Request started
[LoggingInterceptor] [GET] /api/users - 45ms
```

## 테스트

```bash
cd laundrylens-backend && pnpm test
```

## 참고 자료
- [NestJS Interceptors](https://docs.nestjs.com/interceptors)
