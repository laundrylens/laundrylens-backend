# [B-005] Global Exception Filter

## 개요
- 이슈: 전역 예외 처리 필터 구현
- 작업 기간: 2026-01-28

## 구현 내용

### 주요 변경사항
- HttpExceptionFilter 구현
- 모든 예외에 대한 일관된 응답 형식 제공
- ValidationPipe 전역 설정 추가
- 에러 로깅 기능

### 파일 구조
```
src/common/
├── filters/
│   ├── http-exception.filter.ts      # 예외 필터
│   ├── http-exception.filter.spec.ts # 테스트
│   └── index.ts
└── index.ts
```

## 기술적 세부사항

### 에러 응답 형식
```json
{
  "statusCode": 400,
  "message": "에러 메시지",
  "error": "Bad Request",
  "timestamp": "2026-01-28T07:30:00.000Z",
  "path": "/api/endpoint"
}
```

### ValidationPipe 설정
- `whitelist: true` - DTO에 정의되지 않은 속성 제거
- `forbidNonWhitelisted: true` - 정의되지 않은 속성 있으면 에러
- `transform: true` - 자동 타입 변환

## 테스트

```bash
cd laundrylens-backend && pnpm test
```

### 테스트 결과
```
PASS src/common/filters/http-exception.filter.spec.ts
Test Suites: 4 passed, 4 total
Tests:       14 passed, 14 total
```

## 참고 자료
- [NestJS Exception Filters](https://docs.nestjs.com/exception-filters)
