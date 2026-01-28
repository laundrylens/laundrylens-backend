# [B-008] Swagger 문서화

## 개요
- 이슈: API 문서 자동화를 위한 Swagger 설정
- 작업 기간: 2026-01-28

## 구현 내용

### 주요 변경사항
- @nestjs/swagger 패키지 설정
- DocumentBuilder를 통한 API 문서 설정
- `/docs` 엔드포인트에서 Swagger UI 제공
- Bearer 인증 지원

### Swagger 설정
```typescript
const config = new DocumentBuilder()
  .setTitle('LaundryLens API')
  .setDescription('LaundryLens Backend API Documentation')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('docs', app, document);
```

### 접근 방법
- 개발 서버 실행 후 `http://localhost:3000/docs` 접속

## 테스트

```bash
cd laundrylens-backend && pnpm test
```

## 참고 자료
- [NestJS OpenAPI (Swagger)](https://docs.nestjs.com/openapi/introduction)
