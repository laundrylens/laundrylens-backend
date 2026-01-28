# LaundryLens 개발 가이드

## 1. 테스트 코드 필수

- **모든 기능 구현 시 테스트 코드 작성 필수**
- 테스트 통과 없이는 다음 단계로 진행하지 않음
- 테스트 커버리지 목표: 80% 이상

```bash
# Frontend 테스트
cd laundrylens-frontend && pnpm test

# Backend 테스트
cd laundrylens-backend && pnpm test
```

### 테스트 종류
| 종류 | 대상 | 도구 |
|------|------|------|
| Unit Test | 함수, 유틸리티 | Vitest (FE), Jest (BE) |
| Component Test | React 컴포넌트 | React Testing Library |
| Integration Test | API 엔드포인트 | Supertest |
| E2E Test | 전체 플로우 | Playwright (선택) |

---

## 2. 이슈별 구현 문서 작성

### 워크플로우
이슈 구현은 **하나의 문서**를 단계별로 업데이트하며 진행합니다:

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ 1. 계획 작성 │ ─▶ │  2. 구현 &   │ ─▶ │  3. 테스트   │ ─▶ │  4. 커밋 &   │ ─▶ │ 5. 문서 최종 │
│   (구현 전)  │    │  문서 업데이트│    │   통과       │    │   PR 생성    │    │    정리      │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

### 이슈 완료 필수 프로세스

> ⚠️ **중요**: 이슈 하나의 구현이 완료되면 반드시 아래 프로세스를 따릅니다.

```bash
# Step 1: 테스트 실행
pnpm test

# Step 2: 테스트 실패 시 → 통과할 때까지 수정 후 재실행
# Step 3: 테스트 통과 시 → 커밋 진행
git add .
git commit -m "feat(scope): 커밋 메시지"

# Step 4: PR 생성
gh pr create --title "[이슈번호] 이슈 제목" --body "..."
```

**체크리스트:**
- [ ] 모든 테스트 통과 (`pnpm test`)
- [ ] 린트 통과 (`pnpm lint`)
- [ ] 커밋 완료
- [ ] PR 생성 완료
- [ ] 구현 문서 최종 업데이트 완료

### 문서 규칙
- **파일명**: `[이슈번호]-이슈제목.md` (예: `F-011-로그인-페이지-UI.md`)
- **위치**: `laundrylens-docs/issues/` 폴더
- **보안 주의**: 환경 변수, API 키, 토큰 등 민감 정보는 절대 기재하지 않음
- **작성 시점**: 구현 시작 전에 계획 섹션 먼저 작성

### 문서 템플릿

```markdown
# [이슈번호] 이슈 제목

## 개요
- 이슈 링크: https://github.com/laundrylens/...
- 작성일: YYYY-MM-DD
- 상태: 계획 중 / 구현 중 / 완료

---

## 1. 구현 계획 (구현 전 작성)

### 목표
- 이 이슈에서 달성하고자 하는 목표

### 구현 범위
**포함:**
- 구현할 기능 1
- 구현할 기능 2

**제외:**
- 이번 이슈에서 제외할 항목

### 기술적 접근 방식
- 사용할 패턴: (예: Repository Pattern, Custom Hook 등)
- 데이터 흐름: (예: API → Service → Controller)

### 예상 파일 구조
```
src/
├── 생성할파일.ts
└── 수정할파일.ts
```

### 구현 단계
- [ ] 단계 1 - 설명
- [ ] 단계 2 - 설명
- [ ] 단계 3 - 설명

### 테스트 계획
- [ ] 테스트 케이스 1
- [ ] 테스트 케이스 2

### 예상 리스크 / 고려사항
- 리스크 1: 대응 방안

---

## 2. 구현 결과 (구현 완료 후 작성)

### 주요 변경사항
- 변경사항 1
- 변경사항 2

### 최종 파일 구조
```
src/
├── 실제생성파일.ts
└── 실제수정파일.ts
```

### 계획 대비 변경사항
| 항목 | 계획 | 실제 | 변경 이유 |
|------|------|------|----------|
| 예시 | A 방식 | B 방식 | 성능 이슈 |

### 테스트 결과
```bash
# 테스트 실행 방법
pnpm test 파일명
```
- [x] 테스트 케이스 1 - 통과
- [x] 테스트 케이스 2 - 통과

---

## 3. 기술적 세부사항

### 사용된 알고리즘/패턴
- 패턴명: 설명

### 디자인 시스템 적용 (UI 작업 시)
- 컬러: primary-500 (#F97316)
- 컴포넌트: Button, Card 등

---

## 4. 트러블슈팅 (에러 기록)

> 구현 중 발생한 모든 에러를 기록합니다.

### 에러 1: [에러 제목]
- **에러 코드/메시지**:
  ```
  Error: Cannot read property 'xxx' of undefined
  ```
- **발생 상황**: 어떤 상황에서 발생했는지
- **원인**: 에러가 발생한 근본 원인
- **해결 방법**:
  ```typescript
  // 해결 코드 또는 설정
  ```
- **참고 링크**: (있다면)

### 에러 2: [에러 제목]
- **에러 코드/메시지**:
- **발생 상황**:
- **원인**:
- **해결 방법**:
- **참고 링크**:

---

## 5. 의사결정 기록

| 날짜 | 결정 사항 | 이유 | 대안 |
|------|----------|------|------|
| YYYY-MM-DD | 결정 내용 | 선택 이유 | 고려했던 대안 |

---

## 6. 참고 자료
- [링크 제목](URL) - 설명
```

---

## 3. 자율 진행 원칙

### 물어보지 않고 진행하는 경우
- 일반적인 구현 방식 선택
- 라이브러리 버전 선택
- 코드 스타일/포맷팅 결정
- 파일/폴더 구조 결정
- 리팩토링 범위 결정
- 테스트 케이스 설계

### 반드시 물어보는 경우
- **보안 관련 의사결정** (인증 방식, 암호화 등)
- **API 키/토큰 발급** (사용자가 직접 발급 필요)
- **유료 서비스 연동** (과금 발생 가능)
- **기존 설계 변경** (DB 스키마 대폭 수정 등)
- **외부 서비스 선택** (결제 PG사, 클라우드 등)

---

## 4. 코드 일관성 유지

### 작업 전 필수 확인
1. `laundrylens-docs/` 문서 전체 읽기
2. 관련 기존 코드 파악
3. 디자인 시스템 확인 (`implementation-plan.md`)
4. API 명세 확인

### 설계 원칙

#### 단일 책임 원칙 (SRP)
- **하나의 클래스/함수는 하나의 책임만 가진다**
- 변경의 이유가 하나여야 한다
- 책임이 여러 개면 분리한다

```typescript
// ❌ Bad - 여러 책임
class UserService {
  createUser() { }
  sendEmail() { }
  generateReport() { }
}

// ✅ Good - 단일 책임
class UserService {
  createUser() { }
}
class EmailService {
  sendEmail() { }
}
class ReportService {
  generateReport() { }
}
```

#### 객체 지향 설계
- **캡슐화**: 내부 상태를 숨기고 메서드로 접근
- **추상화**: 인터페이스로 의존성 역전
- **상속보다 조합**: 컴포지션 패턴 선호
- **의존성 주입**: NestJS DI 컨테이너 활용

```typescript
// Backend - 인터페이스 기반 설계
interface IAnalyzeService {
  analyze(image: Buffer): Promise<AnalysisResult>;
}

@Injectable()
class OpenAIAnalyzeService implements IAnalyzeService {
  analyze(image: Buffer): Promise<AnalysisResult> { }
}
```

```typescript
// Frontend - 커스텀 훅으로 로직 분리
// ❌ Bad - 컴포넌트에 로직 혼재
function SymbolList() {
  const [symbols, setSymbols] = useState([]);
  const [loading, setLoading] = useState(false);
  // fetch 로직...
}

// ✅ Good - 훅으로 분리
function useSymbols() {
  // 데이터 fetching 로직
  return { symbols, loading, error };
}

function SymbolList() {
  const { symbols, loading } = useSymbols();
  // UI만 담당
}
```

### 코드 스타일
```typescript
// Frontend (React + TypeScript)
- 함수형 컴포넌트 + hooks
- Tailwind CSS 클래스 사용
- 디자인 시스템 컬러/간격 준수

// Backend (NestJS + TypeScript)
- 모듈 기반 구조
- DTO 사용
- Prisma 쿼리
```

### 네이밍 컨벤션
| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 | PascalCase | `SymbolCard.tsx` |
| 함수 | camelCase | `fetchSymbols()` |
| 상수 | UPPER_SNAKE | `MAX_ANALYSIS_COUNT` |
| CSS 클래스 | kebab-case (Tailwind) | `text-primary-500` |
| 파일 (컴포넌트) | PascalCase | `Button.tsx` |
| 파일 (유틸) | camelCase | `formatDate.ts` |
| 폴더 | kebab-case | `common/` |

---

## 5. 파일 작업 권한

### laundrylens 폴더 내 자유 작업
- 파일 생성/수정/삭제 시 **확인 없이 진행**
- 폴더 구조 변경 시 **확인 없이 진행**
- 단, 변경 내용은 커밋 메시지에 명확히 기록

### 작업 범위
```
laundrylens/
├── laundrylens-frontend/   ✅ 자유 작업
├── laundrylens-backend/    ✅ 자유 작업
├── laundrylens-docs/       ✅ 자유 작업
└── docs/                   ✅ 자유 작업
```

---

## 6. 보안 규칙

### Git에 올리면 안 되는 파일
```
.env
.env.local
.env.development
.env.production
*.pem
*.key
credentials.json
serviceAccountKey.json
```

### .gitignore 필수 항목
```gitignore
# 환경 변수
.env
.env.*
!.env.example

# 인증서/키
*.pem
*.key
*.p12

# IDE
.idea/
.vscode/

# 의존성
node_modules/

# 빌드
dist/
build/
```

### 커밋 전 보안 점검
```bash
# 1. staged 파일에 .env가 없는지 확인
git status

# 2. .env가 실수로 추가되었다면 제거
git reset HEAD .env

# 3. 이미 커밋된 경우 히스토리에서 제거 필요
# (민감 정보 노출 시 즉시 키 재발급)
```

### 환경 변수 관리
```bash
# .env.example 파일로 템플릿 제공 (값은 비움)
# .env.example
DATABASE_URL=
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
OPENAI_API_KEY=
TOSS_CLIENT_KEY=
TOSS_SECRET_KEY=
```

> ⚠️ **중요**: PR 생성 전 반드시 `git status`로 보안 파일이 포함되지 않았는지 확인

---

## 7. 커밋 규칙

### 핵심 원칙
- **테스트 통과 후 커밋**: 테스트가 완료되지 않으면 커밋하지 않음
- **작은 단위로 커밋**: 하나의 커밋은 하나의 책임만 포함
- **한글로 작성**: 커밋 메시지는 한글로 기재
- **상세하게 작성**: 변경 내용을 명확하게 기술

### 커밋 전 체크리스트
```bash
# 1. 테스트 실행 및 통과 확인
pnpm test

# 2. 린트 검사
pnpm lint

# 3. 보안 파일 확인 (.env가 staged 되지 않았는지)
git status

# 4. 테스트 통과 후에만 커밋
git commit -m "feat(scope): 커밋 메시지"
```

> ⚠️ **중요**: 테스트가 실패하면 기능 개발이 완료된 것이 아님. 테스트 통과 전까지 커밋 금지.

### 커밋 단위 분리 예시
```bash
# ❌ Bad - 여러 책임을 하나의 커밋에
git commit -m "feat: 로그인 기능 구현"
# (카카오 연동 + JWT + UI + 테스트 모두 포함)

# ✅ Good - 책임별로 분리
git commit -m "feat(auth): 카카오 OAuth 인가코드 요청 구현"
git commit -m "feat(auth): 카카오 액세스 토큰 발급 로직 추가"
git commit -m "feat(auth): JWT 토큰 생성 서비스 구현"
git commit -m "feat(ui): 카카오 로그인 버튼 컴포넌트 추가"
git commit -m "test(auth): 카카오 로그인 플로우 테스트 작성"
```

### 커밋 메시지 형식
```
<type>(<scope>): <한글 제목>

<본문 - 변경 내용 상세 설명>

<footer - 관련 이슈>
```

### Type (프리픽스)
| Type | 설명 | 예시 |
|------|------|------|
| `feat` | 새로운 기능 | `feat(auth): 카카오 로그인 버튼 추가` |
| `fix` | 버그 수정 | `fix(api): 토큰 만료 시 갱신 오류 수정` |
| `docs` | 문서 변경 | `docs: F-011 구현 문서 작성` |
| `style` | 코드 포맷팅 | `style: 린트 오류 수정` |
| `refactor` | 리팩토링 | `refactor(auth): 인증 로직 서비스 분리` |
| `test` | 테스트 | `test(auth): JWT 검증 단위 테스트 추가` |
| `chore` | 빌드, 설정 | `chore: ESLint 설정 추가` |

### 예시 (한글)
```
feat(auth): 카카오 인가코드 요청 엔드포인트 구현

- GET /api/auth/kakao 엔드포인트 추가
- 카카오 인증 URL 생성 로직 구현
- redirect_uri 환경변수 처리

Refs #11
```

```
fix(analyze): 이미지 업로드 시 메모리 누수 수정

- 업로드 후 Buffer 해제 로직 추가
- 최대 파일 크기 제한 적용 (5MB)

Fixes #34
```

---

## 8. PR 규칙

> ⚠️ **필수**: 이슈 하나의 구현이 완료되면 **반드시** 커밋 후 PR을 생성합니다. PR 없이 다음 이슈로 넘어가지 않습니다.

### 핵심 원칙
- **이슈 완료 = PR 생성**: 이슈 구현이 완료되면 반드시 PR 생성 (선택 아님)
- **PR 제목 = 이슈 제목**: 동일하게 작성
- **테스트 통과 필수**: 테스트 실패 시 PR 생성 불가

### PR 생성 조건
1. ✅ 이슈의 모든 기능 구현 완료
2. ✅ 모든 테스트 통과
3. ✅ 구현 문서 (`laundrylens-docs/issues/`) 작성 완료
4. ✅ 코드 린트 통과
5. ✅ **README.md 업데이트** (새 기능/변경사항 반영)
6. ✅ 보안 파일 점검 완료 (.env 등 미포함 확인)

### PR 제목 형식
```
[이슈번호] 이슈 제목

# 예시
[F-001] 프로젝트 초기화
[F-011] 로그인 페이지 UI
[B-028] OpenAI Vision API 연동
```

### PR 템플릿
```markdown
## 관련 이슈
- Closes #이슈번호

## 구현 내용
- 구현 내용 1
- 구현 내용 2

## 커밋 목록
- feat(scope): 커밋 1
- feat(scope): 커밋 2
- test(scope): 커밋 3

## 테스트 결과
- [x] 단위 테스트 통과
- [x] 통합 테스트 통과 (해당 시)
- [x] 수동 테스트 완료

## 구현 문서
- [F-001-프로젝트-초기화.md](링크)

## 스크린샷 (UI 변경 시)
| Before | After |
|--------|-------|
| 이미지 | 이미지 |
```

### PR 플로우 (필수)

> 아래 플로우는 **이슈 완료 시 반드시** 따라야 합니다. 건너뛰기 금지.

```
1. 이슈 작업 시작
   └── feature/F-001-프로젝트-초기화 브랜치 생성

2. 구현 (작은 단위 커밋)
   ├── feat: 커밋 1
   ├── feat: 커밋 2
   └── test: 테스트 커밋

3. 테스트 실행 (필수)
   └── pnpm test
   └── ❌ 실패 시: 통과할 때까지 수정 후 재실행
   └── ✅ 통과 시: 다음 단계로

4. 린트 검사 (필수)
   └── pnpm lint

5. 커밋 (필수)
   └── git add . && git commit

6. 구현 문서 최종 업데이트
   └── laundrylens-docs/issues/F-001-프로젝트-초기화.md

7. PR 생성 (필수)
   └── gh pr create --title "[F-001] 프로젝트 초기화"

8. 리뷰 & 머지
   └── develop 브랜치로 머지
```

> ⚠️ **주의**: 테스트 통과 → 커밋 → PR 생성까지 완료해야 해당 이슈 작업이 끝난 것입니다.

---

## 9. 브랜치 전략

```
main
├── develop
│   ├── feature/F-001-프로젝트-초기화
│   ├── feature/F-002-tailwind-설정
│   └── ...
```

- `main`: 프로덕션 배포
- `develop`: 개발 통합
- `feature/*`: 기능 개발

---

## 참고 문서

- [구현 계획서](./docs/implementation-plan.md)
- [이슈 목록](./docs/github-issues.md)
- [디자인 레퍼런스](./ui-referrence.jpg)
