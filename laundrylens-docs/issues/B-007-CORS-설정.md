# [B-007] CORS 설정

## 개요
- 이슈: Cross-Origin Resource Sharing 설정
- 작업 기간: 2026-01-28

## 구현 내용

### 주요 변경사항
- CORS 설정 (ConfigService에서 origin 읽기)
- API 프리픽스 `/api` 설정
- ConfigService를 통한 동적 포트 설정

### CORS 설정
```typescript
app.enableCors({
  origin: configService.get('frontend.url'),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

## 테스트

```bash
cd laundrylens-backend && pnpm test
```

## 참고 자료
- [NestJS CORS](https://docs.nestjs.com/security/cors)
