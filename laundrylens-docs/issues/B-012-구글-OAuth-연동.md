# [B-012] 구글 OAuth 연동

## 개요
- 이슈: 인가코드 → 토큰 → 사용자정보 연동
- 작업 기간: 2026-01-28

## 구현 내용

### 주요 변경사항
- GoogleService 구현 (인가코드 → 토큰 → 사용자정보)
- Auth 컨트롤러에 구글 엔드포인트 추가
- GoogleService 단위 테스트

### 파일 구조
```
src/modules/auth/services/
├── index.ts
├── kakao.service.ts
├── kakao.service.spec.ts
├── google.service.ts
└── google.service.spec.ts
```

## 기술적 세부사항

### API 엔드포인트
| Method | Path | 설명 |
|--------|------|------|
| GET | /api/auth/google | 구글 로그인 페이지로 리다이렉트 |
| GET | /api/auth/google/callback | 구글 OAuth 콜백 (프론트엔드 리다이렉트) |
| POST | /api/auth/google/token | 인가코드로 JWT 발급 |

### GoogleService 메서드
| 메서드 | 설명 |
|--------|------|
| `getAuthorizationUrl` | 구글 인가 URL 생성 |
| `getAccessToken` | 인가코드로 액세스 토큰 발급 |
| `getUserInfo` | 액세스 토큰으로 사용자 정보 조회 |
| `authenticate` | 전체 인증 플로우 실행 |
| `revokeToken` | 토큰 취소 (연결 해제) |

### 인증 플로우
```
1. 프론트엔드 → GET /api/auth/google → 구글 로그인 페이지
2. 사용자 로그인 → 구글 → GET /api/auth/google/callback?code=xxx
3. 백엔드: 인가코드 → 구글 토큰 → 사용자 정보
4. 신규/기존 사용자 처리 → JWT 발급
5. 프론트엔드로 리다이렉트 (토큰 포함)
```

## 테스트

```bash
cd laundrylens-backend && pnpm test
```

### 테스트 케이스
- [x] GoogleService - getAuthorizationUrl
- [x] GoogleService - getAccessToken 성공/실패
- [x] GoogleService - getUserInfo 성공/실패
- [x] GoogleService - authenticate

## 참고 자료
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
