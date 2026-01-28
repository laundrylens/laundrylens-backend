# LaundryLens 구현 계획

## 프로젝트 개요
세탁기호를 알려주는 웹 서비스. 국가별 세탁기호 정보 제공 및 AI 기반 이미지 분석 기능.
비회원 AI 분석 5회 제한, 유료 회원 무제한.

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React 18 + Vite + TypeScript |
| Backend | NestJS + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| AI | OpenAI GPT-4o-mini Vision API |
| 인증 | 카카오 싱크 + Google OAuth + JWT |
| 결제 | 토스페이먼츠 |
| Styling | Tailwind CSS |
| 상태관리 | Zustand |
| API 통신 | Axios + React Query |
| 광고 | Google AdSense |

---

## 폴더 구조

```
laundrylens/
├── laundrylens-frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ads/             # 광고 컴포넌트
│   │   │   ├── auth/            # 카카오 로그인 버튼, 인증 상태
│   │   │   ├── payment/         # 결제 관련 컴포넌트
│   │   │   └── common/          # 공통 컴포넌트
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── stores/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   └── assets/
│   ├── public/
│   └── package.json
│
├── laundrylens-backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/            # 인증 모듈
│   │   │   ├── users/           # 사용자 모듈
│   │   │   ├── symbols/         # 세탁기호 모듈
│   │   │   ├── materials/       # 소재 가이드 모듈
│   │   │   ├── analyze/         # AI 분석 모듈
│   │   │   ├── payment/         # 결제 모듈
│   │   │   └── subscription/    # 구독 모듈
│   │   ├── common/
│   │   │   ├── guards/          # 인증 가드
│   │   │   ├── decorators/      # 커스텀 데코레이터
│   │   │   ├── filters/         # 예외 필터
│   │   │   └── interceptors/    # 인터셉터
│   │   ├── config/
│   │   └── prisma/
│   └── package.json
│
└── docs/
```

---

## 데이터베이스 스키마

### 1. users (사용자)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| email | VARCHAR | 이메일 (nullable, unique) |
| nickname | VARCHAR | 닉네임 |
| profile_image | VARCHAR | 프로필 이미지 URL |
| is_premium | BOOLEAN | 프리미엄 여부 |
| created_at | TIMESTAMP | 가입일 |
| updated_at | TIMESTAMP | 수정일 |
| deleted_at | TIMESTAMP | 탈퇴일 (soft delete) |

### 2. social_accounts (소셜 계정 연결)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| user_id | UUID | FK → users |
| provider | ENUM | 제공자 (kakao, google) |
| provider_id | VARCHAR | 소셜 서비스 고유 ID |
| access_token | VARCHAR | 액세스 토큰 (암호화) |
| refresh_token | VARCHAR | 리프레시 토큰 (암호화) |
| created_at | TIMESTAMP | 연결일 |
| UNIQUE | | (provider, provider_id) |

### 3. subscriptions (구독)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| user_id | UUID | FK → users |
| plan_type | ENUM | 플랜 (monthly, credits) |
| credits | INT | 남은 크레딧 (건당 결제 시) |
| started_at | TIMESTAMP | 구독 시작일 |
| expires_at | TIMESTAMP | 만료일 |
| status | ENUM | 상태 (active, cancelled, expired) |
| created_at | TIMESTAMP | 생성일 |

### 4. payments (결제 내역)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| user_id | UUID | FK → users |
| order_id | VARCHAR | 토스 주문 ID |
| payment_key | VARCHAR | 토스 결제 키 |
| amount | INT | 결제 금액 |
| plan_type | ENUM | 플랜 타입 |
| status | ENUM | 상태 (pending, completed, failed, refunded) |
| created_at | TIMESTAMP | 결제일 |

### 5. usage_logs (사용 이력)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| user_id | UUID | FK → users (nullable, 비회원은 null) |
| guest_id | VARCHAR | 비회원 식별자 (localStorage UUID) |
| action | VARCHAR | 행동 (analyze) |
| created_at | TIMESTAMP | 사용일 |

### 6. laundry_symbols (세탁기호 마스터)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| category | VARCHAR | 카테고리 (wash, bleach, dry, iron, dryclean) |
| code | VARCHAR | 고유 코드 (예: WASH_30) |
| icon_url | VARCHAR | 아이콘 이미지 URL |
| created_at | TIMESTAMP | 생성일 |

### 7. symbol_translations (국가별 번역)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| symbol_id | UUID | FK → laundry_symbols |
| country_code | VARCHAR | 국가코드 (KR, US, JP) |
| name | VARCHAR | 기호 이름 |
| short_desc | VARCHAR | 간략 설명 |
| detail_desc | TEXT | 상세 설명 |

### 8. analysis_history (분석 이력)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| user_id | UUID | FK → users (nullable) |
| guest_id | VARCHAR | 비회원 식별자 |
| image_url | VARCHAR | 업로드 이미지 |
| result | JSONB | 분석 결과 |
| created_at | TIMESTAMP | 분석일 |

### 9. materials (소재)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| code | VARCHAR | 소재 코드 (cotton, wool, silk 등) |
| name_ko | VARCHAR | 한국어명 |
| name_en | VARCHAR | 영어명 |
| name_jp | VARCHAR | 일본어명 |
| description | TEXT | 소재 설명 |
| care_tips | TEXT | 세탁 팁 |
| created_at | TIMESTAMP | 생성일 |

### 10. material_symbols (소재별 자주 나타나는 기호)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| material_id | UUID | FK → materials |
| symbol_id | UUID | FK → laundry_symbols |
| frequency | ENUM | 빈도 (always, often, sometimes) |
| note | VARCHAR | 부가 설명 (예: "울 전용 세제 사용 시") |

---

## API 엔드포인트

### 인증 (소셜 로그인)
```
# 카카오
GET  /api/auth/kakao               # 카카오 로그인 페이지로 리다이렉트
GET  /api/auth/kakao/callback      # 카카오 인가코드 콜백 → 로그인/회원가입 처리

# 구글
GET  /api/auth/google              # 구글 로그인 페이지로 리다이렉트
GET  /api/auth/google/callback     # 구글 인가코드 콜백 → 로그인/회원가입 처리

# 공통
POST /api/auth/logout              # 로그아웃
POST /api/auth/refresh             # JWT 토큰 갱신
GET  /api/auth/me                  # 내 정보 조회
DELETE /api/auth/withdraw          # 회원탈퇴 (소셜 연결끊기 + 데이터 삭제)
```

### 세탁기호 조회
```
GET  /api/symbols                  # 전체 기호 목록
GET  /api/symbols/:id              # 기호 상세 (다국어 포함)
GET  /api/symbols?country=KR       # 국가별 필터링
GET  /api/symbols?category=wash    # 카테고리별 필터링
```

### 이미지 분석
```
POST /api/analyze                  # 이미지 업로드 & 분석
GET  /api/analyze/remaining        # 남은 분석 횟수 조회
```

### 결제/구독
```
POST /api/payment/ready            # 결제 준비 (토스 결제창 호출 전)
POST /api/payment/confirm          # 결제 승인 (토스 콜백)
GET  /api/payment/history          # 결제 내역
POST /api/subscription/cancel      # 구독 취소
GET  /api/subscription/status      # 구독 상태 조회
```

### 국가 정보
```
GET  /api/countries                # 지원 국가 목록
```

### 소재 가이드
```
GET  /api/materials                # 소재 목록
GET  /api/materials/:code          # 소재 상세 (세탁팁 + 자주 나타나는 기호)
```

---

## 페이지 구성

### 1. 메인 페이지 (/)
- 히어로 섹션: 서비스 소개 + 이미지 업로드 CTA
- 빠른 기호 검색
- 주요 기능 소개
- 요금제 소개 섹션

### 2. 기호 사전 페이지 (/symbols)
- 국가 선택 탭 (한국, 미국, 일본)
- 카테고리별 필터 (세탁, 표백, 건조, 다림질, 드라이클리닝)
- 기호 그리드 뷰
- 기호 클릭 → 모달로 상세 정보 + 타국가 비교

### 3. 이미지 분석 페이지 (/analyze)
- 남은 무료 분석 횟수 표시 (비회원/무료회원)
- 이미지 업로드 (드래그앤드롭 / 파일선택 / 카메라)
- 분석 중 로딩 애니메이션
- 분석 결과: 인식된 기호 목록 + 세탁 팁
- 횟수 초과 시 → 요금제 안내 모달

### 4. 세탁 가이드 페이지 (/guide)
- 소재별 세탁 팁 (면, 울, 실크, 폴리에스터 등)
- **소재별 자주 나타나는 세탁기호 표시** (기호 클릭 시 상세 페이지 연결)
- 세탁기 설정 가이드

### 5. 로그인 페이지 (/login)
- 카카오 로그인 버튼 (카카오 싱크)
- 구글 로그인 버튼 (Google OAuth)
- 로그인 시 자동 회원가입 처리
- 비회원 계속 사용 옵션

### 6. 요금제 페이지 (/pricing)
- 무료 플랜 vs 유료 플랜 비교 표
- 월 구독 / 건당 결제 선택
- 결제 버튼 → 토스페이먼츠 연동

### 7. 마이페이지 (/mypage)
- 내 정보 (카카오 프로필)
- 구독 현황 / 남은 크레딧
- 결제 내역
- 분석 이력
- 로그아웃
- 회원탈퇴

### 8. 정책 페이지 (AdSense 승인용)
- 개인정보처리방침 (/privacy)
- 이용약관 (/terms)
- 서비스 소개 (/about)

---

## 디자인 시스템

### 디자인 컨셉
- **모던 & 미니멀**: 불필요한 요소 배제, 깔끔한 레이아웃
- **소프트 라운딩**: 부드럽고 친근한 느낌 (8px~16px radius)
- **밝은 톤**: 화이트/라이트 그레이 기반
- **그림자 활용**: 카드, 버튼에 은은한 그림자로 깊이감

### 컬러 팔레트

```css
:root {
  /* Primary - 오렌지 */
  --primary-50: #FFF7ED;
  --primary-100: #FFEDD5;
  --primary-200: #FED7AA;
  --primary-300: #FDBA74;
  --primary-400: #FB923C;
  --primary-500: #F97316;    /* 메인 오렌지 */
  --primary-600: #EA580C;
  --primary-700: #C2410C;

  /* Secondary - 다크 네이비 */
  --secondary-50: #F8FAFC;
  --secondary-100: #F1F5F9;
  --secondary-200: #E2E8F0;
  --secondary-300: #CBD5E1;
  --secondary-400: #94A3B8;
  --secondary-500: #64748B;
  --secondary-600: #475569;
  --secondary-700: #334155;
  --secondary-800: #1E293B;   /* 메인 다크 네이비 */
  --secondary-900: #0F172A;

  /* Neutral - 그레이 */
  --neutral-50: #FAFAFA;
  --neutral-100: #F5F5F5;     /* 배경 */
  --neutral-200: #E5E5E5;     /* 구분선 */
  --neutral-300: #D4D4D4;
  --neutral-400: #A3A3A3;     /* 비활성 텍스트 */
  --neutral-500: #737373;
  --neutral-600: #525252;
  --neutral-700: #404040;
  --neutral-800: #262626;     /* 본문 텍스트 */
  --neutral-900: #171717;     /* 제목 텍스트 */

  /* Semantic */
  --success: #22C55E;
  --warning: #EAB308;
  --error: #EF4444;
  --info: #3B82F6;

  /* Background */
  --bg-primary: #FFFFFF;
  --bg-secondary: #F5F5F5;
  --bg-card: #FFFFFF;
}
```

### Tailwind 설정 (tailwind.config.js)

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
        },
        navy: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
      },
      borderRadius: {
        'soft': '12px',
        'softer': '16px',
        'card': '20px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 16px rgba(0, 0, 0, 0.06)',
        'elevated': '0 8px 24px rgba(0, 0, 0, 0.08)',
      },
    },
  },
}
```

### 단위 시스템

| 속성 | 단위 | 이유 |
|------|------|------|
| **폰트 크기** | `rem` | 브라우저/OS 폰트 설정 반영 |
| **간격 (padding, margin)** | `px` | 일관된 레이아웃 유지 |
| **라운딩, 그림자** | `px` | 고정 시각 효과 |
| **컨테이너 높이** | `min-height` | 폰트 확대 시 확장 가능 |
| **줄 간격** | 비율 (1.5) | 폰트 크기에 비례 |

### 타이포그래피 (rem 기반)

```css
/* 기본: 1rem = 16px (브라우저 기본값) */
html {
  font-size: 100%; /* 사용자 설정 존중, 16px 강제 금지 */
}
```

| 용도 | 크기 | rem | 굵기 | line-height |
|------|------|-----|------|-------------|
| H1 (페이지 제목) | 28px 기준 | 1.75rem | 700 | 1.3 |
| H2 (섹션 제목) | 22px 기준 | 1.375rem | 600 | 1.4 |
| H3 (카드 제목) | 18px 기준 | 1.125rem | 600 | 1.4 |
| Body | 16px 기준 | 1rem | 400 | 1.6 |
| Body Small | 14px 기준 | 0.875rem | 400 | 1.5 |
| Caption | 12px 기준 | 0.75rem | 400 | 1.5 |

**폰트**: Pretendard (한글) + Inter (영문)

### 폰트 크기 조절 대응 (접근성)

#### 원칙
1. **고정 높이 금지**: `height` 대신 `min-height` 사용
2. **텍스트 컨테이너**: `overflow: visible` 또는 스크롤 처리
3. **말줄임 주의**: `truncate` 사용 시 툴팁 제공
4. **터치 영역**: 최소 44px × 44px 유지 (WCAG 기준)

#### Tailwind 클래스 예시
```jsx
// ❌ Bad - 폰트 확대 시 레이아웃 깨짐
<div className="h-12">
  <p className="text-base truncate">텍스트</p>
</div>

// ✅ Good - 폰트 확대에 유연하게 대응
<div className="min-h-[48px] py-3">
  <p className="text-base leading-relaxed">텍스트</p>
</div>
```

#### CSS 설정
```css
/* 폰트 크기 조절 허용 (iOS Safari 대응) */
html {
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

/* 최소 터치 영역 보장 */
button, a, [role="button"] {
  min-height: 44px;
  min-width: 44px;
}

/* 줄 간격 - 폰트에 비례 */
body {
  line-height: 1.6;
}

/* 폰트 200% 확대까지 지원 (WCAG AA) */
@media (min-resolution: 1dppx) {
  /* 텍스트 컨테이너 유연하게 */
  .text-container {
    min-height: auto;
    overflow-wrap: break-word;
    word-break: keep-all;
  }
}
```

### 모바일 퍼스트 디자인

#### 접근 방식
```css
/* 모바일 기본 → 큰 화면으로 확장 */
.component {
  padding: 16px;           /* 모바일 기본 */
}

@media (min-width: 768px) {
  .component {
    padding: 24px;         /* 태블릿 이상 */
  }
}
```

#### Tailwind 모바일 퍼스트
```jsx
// 모바일 → 태블릿 → 데스크탑 순서로 작성
<div className="
  px-4 py-3          /* 모바일 기본 */
  md:px-6 md:py-4    /* 태블릿 */
  lg:px-8 lg:py-5    /* 데스크탑 */
">
```

#### 플랫폼별 고려사항

| 플랫폼 | 폰트 설정 위치 | 기본 크기 |
|--------|---------------|----------|
| iOS | 설정 > 디스플레이 > 텍스트 크기 | Dynamic Type |
| Android | 설정 > 디스플레이 > 글꼴 크기 | 1.0x ~ 1.3x |
| Web | 브라우저 설정 > 글꼴 크기 | 16px 기본 |

#### 테스트 체크리스트
- [ ] 브라우저 폰트 크기 200%에서 레이아웃 정상
- [ ] iOS Dynamic Type "가장 크게"에서 정상
- [ ] Android 글꼴 크기 "가장 크게"에서 정상
- [ ] 가로 스크롤 발생하지 않음
- [ ] 텍스트 잘림 없이 전체 표시 (또는 더보기 제공)

### 컴포넌트 스타일 (폰트 확대 대응)

#### 버튼
```jsx
// Primary Button - min-height로 터치 영역 보장
<button className="bg-primary-500 hover:bg-primary-600 text-white
  px-6 py-3 min-h-[44px] rounded-soft font-semibold shadow-soft
  transition-all duration-200 text-base leading-normal">
  시작하기
</button>

// Secondary Button
<button className="bg-white border border-navy-200 text-navy-700
  hover:bg-navy-50 px-6 py-3 min-h-[44px] rounded-soft font-semibold
  shadow-soft transition-all duration-200 text-base leading-normal">
  더 알아보기
</button>

// Ghost Button
<button className="text-primary-500 hover:bg-primary-50
  px-4 py-2 min-h-[44px] rounded-soft font-medium
  transition-all duration-200 text-base">
  취소
</button>
```

#### 카드
```jsx
// min-height 사용, 내부 콘텐츠에 따라 확장
<div className="bg-white rounded-card shadow-card p-6
  hover:shadow-elevated transition-shadow duration-200
  min-h-fit">
  {/* 콘텐츠 - 고정 높이 금지 */}
</div>
```

#### 입력 필드
```jsx
// py로 여백, min-height로 최소 터치 영역
<input className="w-full px-4 py-3 min-h-[48px] rounded-soft
  border border-navy-200 text-base leading-normal
  focus:border-primary-500 focus:ring-2 focus:ring-primary-100
  outline-none transition-all duration-200" />
```

#### 세탁기호 그리드 아이템
```jsx
// 아이콘은 고정, 텍스트는 유연하게
<div className="bg-white rounded-softer p-4 shadow-soft
  hover:shadow-card cursor-pointer transition-all duration-200
  border-2 border-transparent hover:border-primary-200
  flex flex-col items-center min-h-fit">
  {/* 아이콘: 고정 크기 (px) */}
  <div className="w-12 h-12 flex-shrink-0 mb-2">{/* SVG */}</div>
  {/* 텍스트: rem 기반, 여러 줄 허용 */}
  <p className="text-sm text-navy-700 text-center leading-snug">
    30°C 세탁
  </p>
</div>
```

#### 리스트 아이템
```jsx
// 텍스트 길이에 따라 높이 유연하게
<li className="flex items-start gap-3 py-3 min-h-[44px]
  border-b border-navy-100">
  <span className="flex-shrink-0 w-6 h-6 mt-0.5">{/* 아이콘 */}</span>
  <span className="text-base leading-relaxed flex-1">
    긴 텍스트도 자연스럽게 줄바꿈되어 표시됩니다.
  </span>
</li>
```

### 레이아웃 가이드 (모바일 퍼스트)

```
Mobile (< 768px)
┌─────────────────────┐
│ Header (min-h-14)   │  ← sticky, 내용에 따라 확장
├─────────────────────┤
│ Content             │
│ (px-4, w-full)      │
│                     │
│ ┌─────────────────┐ │
│ │ Card (p-4)      │ │
│ │ rounded-card    │ │
│ └─────────────────┘ │
│                     │
├─────────────────────┤
│ Footer              │
│ (py-8, px-4)        │
└─────────────────────┘

Desktop (≥ 1024px)
┌───────────────────────────────────────┐
│ Header (min-h-16, px-8)               │
├───────────────────────────────────────┤
│                                       │
│   Content (max-w-6xl mx-auto px-8)    │
│                                       │
│   ┌─────────────────────────────────┐ │
│   │ Card (p-6, rounded-card)        │ │
│   └─────────────────────────────────┘ │
│                                       │
├───────────────────────────────────────┤
│ Footer (py-12, px-8)                  │
└───────────────────────────────────────┘
```

### 간격 시스템 (px 고정)
| 용도 | 모바일 | 태블릿 | 데스크탑 |
|------|--------|--------|----------|
| 페이지 좌우 | 16px | 24px | 32px |
| 카드 내부 | 16px | 20px | 24px |
| 카드 간 간격 | 12px | 16px | 20px |
| 섹션 간 간격 | 40px | 56px | 72px |

```jsx
// Tailwind 예시
<main className="px-4 md:px-6 lg:px-8">
  <section className="py-10 md:py-14 lg:py-18">
    <div className="grid gap-3 md:gap-4 lg:gap-5">
```

### 그리드 시스템
```jsx
// 세탁기호 그리드 - 화면 크기에 따라 컬럼 수 조절
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
  {/* 기호 아이템 */}
</div>

// 가이드 카드 그리드
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
  {/* 가이드 카드 */}
</div>
```

### 애니메이션 (모션 감소 설정 존중)
```css
/* 기본 트랜지션 */
transition-all duration-200 ease-out

/* 모션 감소 설정 시 애니메이션 비활성화 */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

```jsx
// Tailwind에서 모션 감소 대응
<div className="transition-all duration-200 motion-reduce:transition-none">
```

### 반응형 브레이크포인트
| 이름 | 크기 | 용도 | 주요 변경점 |
|------|------|------|-------------|
| base | 0px~ | 모바일 세로 | 기본 스타일 |
| sm | 640px~ | 모바일 가로 | 2열 그리드 |
| md | 768px~ | 태블릿 | 사이드 여백 확대 |
| lg | 1024px~ | 데스크탑 | max-width 적용 |
| xl | 1280px~ | 큰 데스크탑 | 더 넓은 여백 |

---

## 소셜 로그인 인증

### Provider 패턴 구조
```
src/modules/auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts           # 공통 로직 (JWT, 회원가입/로그인)
├── strategies/
│   ├── kakao.strategy.ts     # 카카오 OAuth 처리
│   └── google.strategy.ts    # 구글 OAuth 처리
├── guards/
│   └── jwt-auth.guard.ts
└── dto/
```

### 필요한 동의 항목

| Provider | 항목 | 필수 | 용도 |
|----------|------|------|------|
| 카카오 | 닉네임 | O | 서비스 내 표시 |
| 카카오 | 프로필 사진 | X | 마이페이지 표시 |
| 카카오 | 이메일 | X | 결제 영수증 발송 |
| 구글 | email | O | 계정 식별, 영수증 |
| 구글 | profile | O | 닉네임, 프로필 사진 |

### 공통 인증 플로우

```
[소셜 로그인 버튼 클릭]
       ↓
[GET /api/auth/{provider}]
  → 해당 소셜 인가 페이지로 리다이렉트
       ↓
[사용자: 소셜 로그인 + 동의]
       ↓
[소셜 서비스 → 콜백 URL로 인가코드 전달]
  GET /api/auth/{provider}/callback?code=xxx
       ↓
[백엔드: 인가코드로 토큰 요청]
       ↓
[백엔드: 액세스 토큰으로 사용자 정보 조회]
       ↓
[백엔드: social_accounts 조회]
  → 기존 연결 있음: 해당 user로 로그인
  → 신규: users 생성 + social_accounts 생성
       ↓
[JWT 발급 → 프론트로 전달]
       ↓
[프론트: JWT 저장 → 로그인 완료]
```

### 로그아웃 플로우
```
[로그아웃 버튼 클릭]
       ↓
[POST /api/auth/logout]
       ↓
[백엔드: Refresh Token 삭제]
       ↓
[프론트: JWT 삭제 → 로그아웃 완료]
```

### 회원탈퇴 플로우
```
[회원탈퇴 버튼 클릭]
       ↓
[탈퇴 확인 모달]
       ↓
[DELETE /api/auth/withdraw]
       ↓
[백엔드: 연결된 모든 소셜 계정 연결끊기]
  - 카카오: POST https://kapi.kakao.com/v1/user/unlink
  - 구글: POST https://oauth2.googleapis.com/revoke
       ↓
[백엔드: 사용자 데이터 soft delete]
  - users.deleted_at = now()
  - social_accounts 삭제
  - 구독 취소 처리
       ↓
[프론트: JWT 삭제 → 메인페이지 이동]
```

### 소셜 서비스 설정

#### 카카오
1. https://developers.kakao.com 앱 생성
2. 플랫폼 등록 (Web: 도메인)
3. 카카오 로그인 활성화
4. 동의 항목 설정 (닉네임, 프로필, 이메일)
5. 카카오 싱크 활성화
6. Redirect URI: `{도메인}/api/auth/kakao/callback`

#### 구글
1. https://console.cloud.google.com 프로젝트 생성
2. OAuth 동의 화면 설정
3. 사용자 인증 정보 > OAuth 2.0 클라이언트 ID 생성
4. 승인된 리디렉션 URI: `{도메인}/api/auth/google/callback`
5. 필요한 스코프: `email`, `profile`

---

## 회원 & 결제 시스템

### 사용자 유형
| 유형 | AI 분석 | 광고 |
|------|---------|------|
| 비회원 (guest) | 5회/일 | O |
| 무료 회원 | 5회/일 | O |
| 유료 회원 (구독) | 무제한 | O |
| 유료 회원 (크레딧) | 크레딧만큼 | O |

### 비회원 제한 로직
```
1. 최초 접속 시 localStorage에 guestId (UUID) 생성
2. 분석 요청 시 guestId로 usage_logs 조회
3. 오늘 날짜 기준 5회 이상이면 차단
4. 차단 시 → 회원가입/로그인 유도 모달
```

### 요금제 (예시)
| 플랜 | 가격 | 내용 |
|------|------|------|
| 무료 | ₩0 | AI 분석 5회/일 |
| 월 구독 | ₩3,900/월 | AI 분석 무제한 |
| 크레딧 100회 | ₩5,000 | 100회 분석권 (무기한) |
| 크레딧 300회 | ₩12,000 | 300회 분석권 (무기한) |

### 토스페이먼츠 연동 흐름
```
1. [프론트] 결제하기 클릭 → POST /api/payment/ready
2. [백엔드] 주문 정보 생성 → orderId 반환
3. [프론트] 토스 결제창 호출 (SDK)
4. [토스] 결제 완료 → successUrl로 리다이렉트
5. [프론트] paymentKey, orderId로 POST /api/payment/confirm
6. [백엔드] 토스 API로 결제 승인 요청
7. [백엔드] 승인 성공 → DB 업데이트 (구독/크레딧)
8. [프론트] 완료 페이지 표시
```

---

## 구현 단계

### Phase 1: 기본 세팅 (Day 1-2)
- [ ] Frontend 프로젝트 초기화 (Vite + React + TS)
- [ ] Backend 프로젝트 초기화 (NestJS)
- [ ] PostgreSQL + Prisma 설정
- [ ] Tailwind CSS 설정 + 디자인 시스템 적용
- [ ] 폰트 설정 (Pretendard + Inter)
- [ ] 공통 컴포넌트 제작 (Button, Card, Input)
- [ ] 기본 라우팅 및 레이아웃 (Header, Footer)
- [ ] 환경변수 설정

### Phase 2: 소셜 로그인 인증 (Day 3-5)
- [ ] 카카오 개발자 앱 등록 및 카카오 싱크 설정
- [ ] Google Cloud Console 앱 등록 및 OAuth 설정
- [ ] 소셜 로그인 공통 로직 구현 (Provider 패턴)
- [ ] 카카오 로그인 API 연동
- [ ] 구글 로그인 API 연동
- [ ] 자동 회원가입 처리 (첫 로그인 시 users + social_accounts 생성)
- [ ] JWT 발급 및 Refresh Token 구현
- [ ] 로그아웃 (소셜 연결 해제 포함)
- [ ] 회원탈퇴 (소셜 연결끊기 + 데이터 soft delete)
- [ ] 로그인 페이지 UI (카카오 + 구글 버튼)
- [ ] 인증 상태 관리 (Zustand)

### Phase 3: 세탁기호 사전 (Day 6-8)
- [ ] DB에 세탁기호 데이터 시딩
- [ ] 기호 목록/상세 API 개발
- [ ] 기호 사전 페이지 UI 구현
- [ ] 국가별/카테고리별 필터링

### Phase 4: 이미지 분석 (Day 9-11)
- [ ] OpenAI Vision API 연동
- [ ] 이미지 업로드 컴포넌트
- [ ] 분석 결과 UI
- [ ] 비회원 5회 제한 로직 구현
- [ ] 사용량 추적 (usage_logs)

### Phase 5: 결제 시스템 (Day 12-15)
- [ ] 토스페이먼츠 연동
- [ ] 요금제 페이지 UI
- [ ] 결제 준비/승인 API
- [ ] 구독 관리 (생성, 취소, 만료 처리)
- [ ] 크레딧 차감 로직
- [ ] 마이페이지 (구독현황, 결제내역)

### Phase 6: 추가 기능 (Day 16-18)
- [ ] 소재 데이터 시딩 (8종)
- [ ] 소재-세탁기호 연결 데이터 시딩
- [ ] 소재 가이드 API 개발
- [ ] 세탁 가이드 페이지 UI (소재별 기호 표시 포함)
- [ ] 분석 이력 저장/조회
- [ ] 반응형 디자인 완성

### Phase 7: AdSense 승인 준비 (Day 19-20)
- [ ] 개인정보처리방침 페이지
- [ ] 이용약관 페이지
- [ ] 서비스 소개(About) 페이지
- [ ] FAQ 페이지
- [ ] 충분한 콘텐츠 확보 (19개 페이지)
- [ ] 사이트맵 생성
- [ ] 광고 컴포넌트 개발 (빈 영역 예약)

### Phase 8: 광고 연동 & 배포 (Day 21-22)
- [ ] Google AdSense 신청
- [ ] 광고 배치 적용
- [ ] 성능 최적화
- [ ] 배포 (Vercel + Railway)
- [ ] 도메인 연결

---

## AdSense 승인 체크리스트

### 필수 조건
- [x] 오리지널 콘텐츠 (세탁기호 데이터, 가이드)
- [ ] 개인정보처리방침 페이지 (/privacy)
- [ ] 이용약관 페이지 (/terms)
- [ ] 서비스 소개 페이지 (/about)
- [ ] 연락처/문의 방법
- [ ] 최소 15개 이상의 실질적 페이지
- [ ] 명확한 네비게이션
- [ ] 모바일 친화적 디자인

### 콘텐츠 페이지 (19개)
1. 메인 페이지
2. 세탁기호 사전 (한국)
3. 세탁기호 사전 (미국)
4. 세탁기호 사전 (일본)
5. 이미지 분석
6. 세탁 가이드 - 면
7. 세탁 가이드 - 울
8. 세탁 가이드 - 실크
9. 세탁 가이드 - 폴리에스터
10. 세탁 가이드 - 데님
11. 세탁 가이드 - 린넨
12. 세탁 가이드 - 캐시미어
13. 세탁 가이드 - 나일론
14. 세탁기 설정 가이드
15. 요금제 안내
16. 서비스 소개
17. 개인정보처리방침
18. 이용약관
19. FAQ (자주 묻는 질문)

### 승인 후 광고 배치
| 페이지 | 위치 | 광고 타입 |
|--------|------|----------|
| 전체 | 헤더 하단 | 배너 (728x90 / 320x100) |
| 메인 | 기능 소개 사이 | 인피드 |
| 기호 사전 | 목록 중간 | 인피드 (10개마다) |
| 분석 결과 | 결과 하단 | 디스플레이 (300x250) |
| 가이드 | 섹션 사이 | 인피드 |

---

## 세탁기호 카테고리

| 카테고리 | 영문 | 기호 수 (예상) |
|----------|------|---------------|
| 세탁 | wash | ~15개 |
| 표백 | bleach | ~5개 |
| 건조 | dry | ~10개 |
| 다림질 | iron | ~5개 |
| 드라이클리닝 | dryclean | ~8개 |

---

## 소재별 자주 나타나는 세탁기호 (예시)

| 소재 | 자주 나타나는 기호 | 세탁 팁 |
|------|-------------------|---------|
| 면 (Cotton) | 세탁 40°C, 표백 가능, 건조기 중온, 다림질 고온 | 색 빠짐 주의, 첫 세탁 시 단독 세탁 |
| 울 (Wool) | 손세탁, 표백 금지, 건조기 금지, 다림질 저온 | 울 전용 세제, 늘어남 방지 건조 |
| 실크 (Silk) | 손세탁/드라이클리닝, 표백 금지, 건조기 금지, 다림질 저온 | 중성세제, 직사광선 건조 금지 |
| 폴리에스터 | 세탁 40°C, 표백 금지, 건조기 저온, 다림질 중온 | 정전기 방지, 섬유유연제 사용 |
| 데님 (Denim) | 세탁 30°C, 표백 금지, 건조기 금지, 다림질 중온 | 뒤집어 세탁, 색 빠짐 주의 |
| 린넨 (Linen) | 세탁 40°C, 표백 가능, 건조기 금지, 다림질 고온 | 구김 심함, 반건조 후 다림질 |
| 캐시미어 | 손세탁, 표백 금지, 건조기 금지, 다림질 금지 | 울 세제, 평평하게 건조 |
| 나일론 | 세탁 30°C, 표백 금지, 건조기 저온, 다림질 저온 | 고온 주의, 변형 위험 |

---

## 추가 고려사항

### 성능
- 이미지 압축 후 업로드 (클라이언트)
- API 응답 캐싱 (React Query)
- 기호 아이콘 SVG 사용
- 광고 Lazy Loading

### UX
- 다크모드 지원
- 남은 분석 횟수 실시간 표시
- 결제 완료 즉시 반영

### 보안
- API Rate Limiting
- 이미지 업로드 크기/타입 제한
- OpenAI API 키 서버사이드 관리
- 결제 정보 암호화
- CSRF 방어

### 모니터링
- 에러 로깅 (Sentry)
- API 사용량 대시보드
- 결제 실패 알림
