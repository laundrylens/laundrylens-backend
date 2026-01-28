# [B-011] 카카오 OAuth 연동

## 개요
- 이슈: 인가코드 → 토큰 → 사용자정보 연동
- 작업 기간: 2026-01-28

## 구현 내용

### 주요 변경사항
- KakaoService 구현 (인가코드 → 토큰 → 사용자정보)
- AuthService 구현 (OAuth 인증, JWT 발급)
- Auth 컨트롤러 엔드포인트 추가
- DTO 및 인터페이스 정의

### 파일 구조
```
src/modules/auth/
├── dto/
│   ├── index.ts
│   ├── oauth-callback.dto.ts
│   └── token-response.dto.ts
├── interfaces/
│   ├── index.ts
│   └── oauth-user.interface.ts
├── services/
│   ├── index.ts
│   ├── kakao.service.ts
│   └── kakao.service.spec.ts
├── auth.module.ts
├── auth.service.ts
├── auth.service.spec.ts
├── auth.controller.ts
└── index.ts
```

## 기술적 세부사항

### API 엔드포인트
| Method | Path | 설명 |
|--------|------|------|
| GET | /api/auth/kakao | 카카오 로그인 페이지로 리다이렉트 |
| GET | /api/auth/kakao/callback | 카카오 OAuth 콜백 (프론트엔드 리다이렉트) |
| POST | /api/auth/kakao/token | 인가코드로 JWT 발급 |

### KakaoService 메서드
| 메서드 | 설명 |
|--------|------|
| `getAuthorizationUrl` | 카카오 인가 URL 생성 |
| `getAccessToken` | 인가코드로 액세스 토큰 발급 |
| `getUserInfo` | 액세스 토큰으로 사용자 정보 조회 |
| `authenticate` | 전체 인증 플로우 실행 |
| `unlinkUser` | 카카오 연결 해제 |

### AuthService 메서드
| 메서드 | 설명 |
|--------|------|
| `validateOAuthUser` | OAuth 사용자 검증/생성 |
| `generateTokens` | JWT 액세스/리프레시 토큰 발급 |
| `createTokenResponse` | 토큰 응답 DTO 생성 |
| `validateToken` | JWT 토큰 검증 |
| `refreshTokens` | 리프레시 토큰으로 새 토큰 발급 |
| `deleteAccount` | 계정 삭제 |

### 인증 플로우
```
1. 프론트엔드 → GET /api/auth/kakao → 카카오 로그인 페이지
2. 사용자 로그인 → 카카오 → GET /api/auth/kakao/callback?code=xxx
3. 백엔드: 인가코드 → 카카오 토큰 → 사용자 정보
4. 신규/기존 사용자 처리 → JWT 발급
5. 프론트엔드로 리다이렉트 (토큰 포함)
```

## 테스트

```bash
cd laundrylens-backend && pnpm test
```

### 테스트 케이스
- [x] KakaoService - getAuthorizationUrl
- [x] KakaoService - getAccessToken 성공/실패
- [x] KakaoService - getUserInfo 성공/실패
- [x] KakaoService - authenticate
- [x] AuthService - validateOAuthUser (기존/신규 사용자)
- [x] AuthService - generateTokens
- [x] AuthService - validateToken
- [x] AuthService - refreshTokens
- [x] AuthService - deleteAccount

## 참고 자료
- [카카오 로그인 REST API](https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api)
- [NestJS JWT](https://docs.nestjs.com/security/authentication)
