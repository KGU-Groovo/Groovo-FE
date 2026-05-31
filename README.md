# Groovo

AI 기반 댄스 학습 모바일 앱

## 소개

Groovo는 K-POP 안무를 쉽고 재미있게 배울 수 있는 앱입니다. 원하는 곡을 검색하고, 안무 영상을 미리보기한 뒤 바로 연습을 시작할 수 있습니다.

## 주요 기능

- **곡 검색** - 원하는 춤을 검색하여 빠르게 찾기
- **영상 미리보기** - 안무 영상을 자동 재생으로 미리 확인
- **난이도 표시** - 곡별 난이도를 음표 아이콘으로 직관적으로 표시
- **기본기 학습** - 댄스 기본기를 단계별로 학습
- **피드** - 다른 사용자들의 댄스 영상 공유
- **마이페이지** - 학습 진행률 및 프로필 관리

## 기술 스택

- **Framework** : React Native (Expo)
- **Routing** : Expo Router
- **Language** : TypeScript
- **Video** : expo-video
- **UI** : expo-linear-gradient, react-native-svg

## 프로젝트 구조

```
├── app/                # 화면 (Expo Router)
│   ├── (tabs)/         # 탭 네비게이션
│   │   ├── index.tsx   # 홈 화면
│   │   ├── basics.tsx  # 기본기
│   │   ├── feed.tsx    # 피드
│   │   └── my.tsx      # 마이페이지
│   └── _layout.tsx     # 루트 레이아웃
├── components/         # 재사용 컴포넌트
│   ├── Header.tsx
│   ├── SearchBar.tsx
│   ├── SongCard.tsx
│   ├── VideoPreview.tsx
│   └── ...
├── constants/          # 상수 및 설정
│   ├── colors.ts
│   ├── songs.ts
│   └── tabBarStyle.ts
└── assets/             # 이미지 및 영상 리소스
```

## 실행 방법

```bash
# 패키지 설치
npm install

# 개발 서버 실행
npx expo start

# 플랫폼별 실행
npx expo start --android
npx expo start --ios
npx expo start --web
```

## 팀

**KGU-Groovo** - 경기대학교
