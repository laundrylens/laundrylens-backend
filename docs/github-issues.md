# LaundryLens GitHub Issues 목록

## Repository 구조
- `laundrylens-frontend` - React + Vite + TypeScript
- `laundrylens-backend` - NestJS + TypeScript
- `laundrylens-docs` - 문서, 기획서, 디자인 가이드

---

## Frontend Issues

### Phase 1: 기본 세팅
| # | 제목 | 설명 | Labels |
|---|------|------|--------|
| F-001 | 프로젝트 초기화 | Vite + React 18 + TypeScript 프로젝트 생성 | setup |
| F-002 | Tailwind CSS 설정 | Tailwind 설치 및 디자인 시스템 컬러/폰트 설정 | setup, design |
| F-003 | 폰트 설정 | Pretendard + Inter 웹폰트 적용 | setup, design |
| F-004 | 공통 Button 컴포넌트 | Primary, Secondary, Ghost 버튼 | component |
| F-005 | 공통 Card 컴포넌트 | 그림자, 라운딩 적용된 카드 | component |
| F-006 | 공통 Input 컴포넌트 | 텍스트 입력, 포커스 스타일 | component |
| F-007 | Header 컴포넌트 | 로고, 네비게이션, 로그인 버튼 | component, layout |
| F-008 | Footer 컴포넌트 | 링크, 저작권 정보 | component, layout |
| F-009 | 기본 라우팅 설정 | React Router 설정, 페이지 구조 | setup |
| F-010 | 환경변수 설정 | .env 파일 및 타입 설정 | setup |

### Phase 2: 소셜 로그인 인증
| # | 제목 | 설명 | Labels |
|---|------|------|--------|
| F-011 | 로그인 페이지 UI | 소셜 로그인 버튼 배치, 비회원 옵션 | page, auth |
| F-012 | 카카오 로그인 버튼 | 카카오 SDK 스타일 버튼 컴포넌트 | component, auth |
| F-013 | 구글 로그인 버튼 | 구글 브랜드 가이드 준수 버튼 | component, auth |
| F-014 | 인증 상태 관리 | Zustand로 로그인 상태, 유저 정보 관리 | state, auth |
| F-015 | 로그인 콜백 처리 | OAuth 콜백 후 JWT 저장 및 리다이렉트 | auth |
| F-016 | 로그아웃 기능 | JWT 삭제, 상태 초기화 | auth |
| F-017 | PrivateRoute 가드 | 로그인 필요 페이지 접근 제어 | auth |

### Phase 3: 세탁기호 사전
| # | 제목 | 설명 | Labels |
|---|------|------|--------|
| F-018 | 기호 사전 페이지 레이아웃 | 필터 + 그리드 레이아웃 | page |
| F-019 | 국가 선택 탭 | 한국, 미국, 일본 탭 전환 | component |
| F-020 | 카테고리 필터 | 세탁, 표백, 건조 등 필터 버튼 | component |
| F-021 | 기호 그리드 뷰 | 반응형 그리드, 기호 카드 | component |
| F-022 | 기호 상세 모달 | 기호 클릭 시 상세 정보 + 타국가 비교 | component, modal |
| F-023 | 기호 데이터 API 연동 | React Query로 기호 목록 fetching | api |
| F-024 | 기호 검색 기능 | 키워드로 기호 검색 | feature |

### Phase 4: 이미지 분석
| # | 제목 | 설명 | Labels |
|---|------|------|--------|
| F-025 | 이미지 분석 페이지 레이아웃 | 업로드 영역 + 결과 영역 | page |
| F-026 | 이미지 업로드 컴포넌트 | 드래그앤드롭, 파일 선택 | component |
| F-027 | 카메라 촬영 기능 | 모바일 카메라 연동 | feature |
| F-028 | 이미지 미리보기 | 업로드 전 이미지 확인 | component |
| F-029 | 이미지 압축 처리 | 클라이언트 사이드 이미지 리사이즈 | feature |
| F-030 | 분석 중 로딩 UI | 스켈레톤 또는 애니메이션 | component |
| F-031 | 분석 결과 UI | 인식된 기호 목록 + 세탁 팁 표시 | component |
| F-032 | 남은 분석 횟수 표시 | 비회원/무료회원 잔여 횟수 | component |
| F-033 | 요금제 안내 모달 | 횟수 초과 시 업그레이드 유도 | component, modal |
| F-034 | 분석 API 연동 | 이미지 전송 및 결과 수신 | api |

### Phase 5: 결제 시스템
| # | 제목 | 설명 | Labels |
|---|------|------|--------|
| F-035 | 요금제 페이지 UI | 플랜 비교 카드, 가격 표시 | page |
| F-036 | 토스페이먼츠 SDK 연동 | 결제 위젯 초기화 | payment |
| F-037 | 결제 진행 플로우 | 결제 준비 → 위젯 → 완료 | payment |
| F-038 | 결제 완료 페이지 | 성공 메시지 및 다음 단계 안내 | page |
| F-039 | 결제 실패 페이지 | 에러 메시지 및 재시도 옵션 | page |
| F-040 | 마이페이지 레이아웃 | 프로필, 구독, 결제내역, 이력 탭 | page |
| F-041 | 프로필 섹션 | 카카오/구글 프로필 정보 표시 | component |
| F-042 | 구독 현황 섹션 | 현재 플랜, 만료일, 크레딧 표시 | component |
| F-043 | 결제 내역 섹션 | 결제 히스토리 리스트 | component |
| F-044 | 구독 취소 기능 | 취소 확인 모달 + API 연동 | feature |
| F-045 | 회원탈퇴 기능 | 탈퇴 확인 모달 + API 연동 | feature, auth |

### Phase 6: 추가 기능
| # | 제목 | 설명 | Labels |
|---|------|------|--------|
| F-046 | 세탁 가이드 페이지 | 소재별 가이드 리스트 | page |
| F-047 | 소재 상세 페이지 | 세탁 팁 + 자주 나타나는 기호 | page |
| F-048 | 분석 이력 페이지 | 과거 분석 결과 목록 | page |
| F-049 | 분석 이력 상세 | 이전 분석 결과 다시 보기 | component |
| F-050 | 메인 페이지 히어로 섹션 | 서비스 소개 + CTA | component |
| F-051 | 메인 페이지 기능 소개 | 주요 기능 카드 | component |
| F-052 | 메인 페이지 요금제 미리보기 | 간단한 플랜 비교 | component |
| F-053 | 반응형 디자인 점검 | 모바일/태블릿/데스크탑 최적화 | design |
| F-054 | 다크모드 지원 | 시스템 설정 연동 | feature, design |

### Phase 7: AdSense 승인 준비
| # | 제목 | 설명 | Labels |
|---|------|------|--------|
| F-055 | 개인정보처리방침 페이지 | 정책 내용 작성 및 UI | page, legal |
| F-056 | 이용약관 페이지 | 약관 내용 작성 및 UI | page, legal |
| F-057 | 서비스 소개 페이지 | About 페이지 | page |
| F-058 | FAQ 페이지 | 자주 묻는 질문 아코디언 | page |
| F-059 | 광고 배너 컴포넌트 | AdSense 배너 래퍼 | component, ads |
| F-060 | 광고 인피드 컴포넌트 | 콘텐츠 사이 광고 | component, ads |
| F-061 | 사이트맵 생성 | SEO용 sitemap.xml | seo |
| F-062 | 메타 태그 설정 | Open Graph, 트위터 카드 | seo |

---

## Backend Issues

### Phase 1: 기본 세팅
| # | 제목 | 설명 | Labels |
|---|------|------|--------|
| B-001 | NestJS 프로젝트 초기화 | Nest CLI로 프로젝트 생성 | setup |
| B-002 | PostgreSQL + Prisma 설정 | DB 연결 및 Prisma 초기화 | setup, database |
| B-003 | 환경변수 설정 | ConfigModule 설정 | setup |
| B-004 | 기본 모듈 구조 생성 | auth, users, symbols 등 모듈 스캐폴딩 | setup |
| B-005 | 전역 예외 필터 | HttpException 처리 | setup |
| B-006 | 요청 로깅 인터셉터 | API 요청/응답 로깅 | setup |
| B-007 | CORS 설정 | 프론트엔드 도메인 허용 | setup |
| B-008 | Swagger 문서 설정 | API 문서 자동 생성 | setup, docs |

### Phase 2: 소셜 로그인 인증
| # | 제목 | 설명 | Labels |
|---|------|------|--------|
| B-009 | users 테이블 마이그레이션 | Prisma 스키마 작성 및 마이그레이션 | database, auth |
| B-010 | social_accounts 테이블 | Provider 패턴 테이블 | database, auth |
| B-011 | 카카오 OAuth 연동 | 인가코드 → 토큰 → 사용자정보 | auth |
| B-012 | 구글 OAuth 연동 | 인가코드 → 토큰 → 사용자정보 | auth |
| B-013 | 자동 회원가입 처리 | 첫 로그인 시 users + social_accounts 생성 | auth |
| B-014 | JWT 발급 | Access Token + Refresh Token 생성 | auth |
| B-015 | JWT 검증 Guard | JwtAuthGuard 구현 | auth |
| B-016 | 토큰 갱신 API | Refresh Token으로 Access Token 재발급 | auth |
| B-017 | 로그아웃 API | Refresh Token 무효화 | auth |
| B-018 | 회원탈퇴 API | 카카오/구글 연결끊기 + soft delete | auth |
| B-019 | 내 정보 조회 API | 현재 로그인 유저 정보 반환 | auth |

### Phase 3: 세탁기호 사전
| # | 제목 | 설명 | Labels |
|---|------|------|--------|
| B-020 | laundry_symbols 테이블 | 세탁기호 마스터 테이블 | database |
| B-021 | symbol_translations 테이블 | 국가별 번역 테이블 | database |
| B-022 | 세탁기호 데이터 시딩 | 전체 기호 데이터 입력 스크립트 | database, seed |
| B-023 | 기호 목록 API | GET /api/symbols | api |
| B-024 | 기호 상세 API | GET /api/symbols/:id | api |
| B-025 | 국가별 필터링 | ?country=KR 쿼리 파라미터 | api |
| B-026 | 카테고리별 필터링 | ?category=wash 쿼리 파라미터 | api |
| B-027 | 지원 국가 목록 API | GET /api/countries | api |

### Phase 4: 이미지 분석
| # | 제목 | 설명 | Labels |
|---|------|------|--------|
| B-028 | OpenAI Vision API 연동 | GPT-4o-mini 이미지 분석 서비스 | api, ai |
| B-029 | 이미지 업로드 처리 | Multer로 파일 업로드 | api |
| B-030 | 분석 프롬프트 설계 | 세탁기호 인식용 프롬프트 작성 | ai |
| B-031 | 분석 결과 파싱 | AI 응답 → 구조화된 데이터 변환 | ai |
| B-032 | analysis_history 테이블 | 분석 이력 저장 테이블 | database |
| B-033 | usage_logs 테이블 | 사용량 추적 테이블 | database |
| B-034 | 비회원 guestId 처리 | 헤더에서 guestId 추출 | feature |
| B-035 | 일일 5회 제한 로직 | 비회원/무료회원 사용량 체크 | feature |
| B-036 | 남은 횟수 조회 API | GET /api/analyze/remaining | api |
| B-037 | 이미지 분석 API | POST /api/analyze | api |

### Phase 5: 결제 시스템
| # | 제목 | 설명 | Labels |
|---|------|------|--------|
| B-038 | subscriptions 테이블 | 구독 정보 테이블 | database, payment |
| B-039 | payments 테이블 | 결제 내역 테이블 | database, payment |
| B-040 | 토스페이먼츠 API 연동 | 결제 승인 API 호출 | payment |
| B-041 | 결제 준비 API | POST /api/payment/ready | api, payment |
| B-042 | 결제 승인 API | POST /api/payment/confirm | api, payment |
| B-043 | 결제 내역 조회 API | GET /api/payment/history | api, payment |
| B-044 | 구독 상태 조회 API | GET /api/subscription/status | api, payment |
| B-045 | 구독 취소 API | POST /api/subscription/cancel | api, payment |
| B-046 | 크레딧 차감 로직 | 분석 시 크레딧 차감 | feature, payment |
| B-047 | 구독 만료 처리 | 만료일 체크 + 상태 업데이트 | feature, payment |
| B-048 | 월 구독 갱신 로직 | 자동 결제 처리 (선택) | feature, payment |

### Phase 6: 추가 기능
| # | 제목 | 설명 | Labels |
|---|------|------|--------|
| B-049 | materials 테이블 | 소재 정보 테이블 | database |
| B-050 | material_symbols 테이블 | 소재-기호 연결 테이블 | database |
| B-051 | 소재 데이터 시딩 | 8종 소재 + 연결 기호 데이터 | database, seed |
| B-052 | 소재 목록 API | GET /api/materials | api |
| B-053 | 소재 상세 API | GET /api/materials/:code | api |
| B-054 | 분석 이력 목록 API | GET /api/analyze/history | api |
| B-055 | 분석 이력 상세 API | GET /api/analyze/history/:id | api |

---

## Docs Issues (laundrylens-docs)

| # | 제목 | 설명 | Labels |
|---|------|------|--------|
| D-001 | 구현 계획서 이동 | implementation-plan.md 이동 | docs |
| D-002 | API 명세서 작성 | 전체 API 엔드포인트 문서 | docs, api |
| D-003 | 디자인 가이드 분리 | 디자인 시스템 별도 문서화 | docs, design |
| D-004 | DB ERD 작성 | 테이블 관계도 | docs, database |
| D-005 | 환경 설정 가이드 | 로컬 개발 환경 셋업 방법 | docs |
| D-006 | 배포 가이드 | Vercel, Railway 배포 방법 | docs |

---

## Labels 정의

| Label | 색상 | 설명 |
|-------|------|------|
| setup | #0E8A16 | 초기 설정 |
| component | #1D76DB | UI 컴포넌트 |
| page | #5319E7 | 페이지 |
| api | #FBCA04 | API 관련 |
| auth | #D93F0B | 인증 관련 |
| database | #006B75 | DB 관련 |
| payment | #B60205 | 결제 관련 |
| feature | #0052CC | 기능 개발 |
| design | #F9D0C4 | 디자인 |
| ai | #7057FF | AI 관련 |
| docs | #C2E0C6 | 문서 |
| seo | #BFD4F2 | SEO |
| ads | #FEF2C0 | 광고 |
| legal | #D4C5F9 | 법률/정책 |
| seed | #EDEDED | 데이터 시딩 |
| modal | #BFDADC | 모달 |
| state | #FFDFBA | 상태관리 |
| layout | #D1BCFF | 레이아웃 |

---

## Milestone 정의

| Milestone | 기간 | 포함 Phase |
|-----------|------|-----------|
| v0.1 - 기본 세팅 | Day 1-2 | Phase 1 |
| v0.2 - 인증 | Day 3-5 | Phase 2 |
| v0.3 - 기호 사전 | Day 6-8 | Phase 3 |
| v0.4 - 이미지 분석 | Day 9-11 | Phase 4 |
| v0.5 - 결제 | Day 12-15 | Phase 5 |
| v0.6 - 추가 기능 | Day 16-18 | Phase 6 |
| v0.7 - AdSense | Day 19-20 | Phase 7 |
| v1.0 - 출시 | Day 21-22 | Phase 8 |
