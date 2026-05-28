# Groovo

Groovo는 [Expo](https://expo.dev)를 기반으로 구축된 React Native 모바일 애플리케이션으로, 실시간 MediaPipe Pose Detection(포즈 감지)을 활용하여 라이브 피드백을 제공합니다. 이 앱은 기기의 카메라를 사용하여 사용자의 움직임을 캡처하고, 신체 포즈 랜드마크를 화면에 실시간으로 오버레이합니다.

## 주요 기능 (Features)

- **라이브 피드백 (Live Feedback)**: 실시간 카메라 피드 분석 및 시각화.
- **포즈 감지 (Pose Detection)**: `@thinksys/react-native-mediapipe`를 연동하여 정확한 신체 랜드마크 감지.
- **고성능 (High-Performance)**: `react-native-vision-camera` 및 `react-native-worklets-core`를 활용하여 끊김 없는 실시간 비디오 처리 보장.
- **Expo Router**: 파일 기반 라우팅을 통한 매끄러운 화면 전환 제공.

## 사전 요구 사항 (Prerequisites)

- Node.js (v18 이상 권장)
- npm 또는 yarn
- iOS 시뮬레이터 / Android 에뮬레이터 또는 Expo Go가 설치된 실제 기기

## 설치 (Installation)

1. 의존성 패키지를 설치합니다:
   ```bash
   npm install
   ```

2. MediaPipe 모델 파일(`pose_landmarker_lite.task`)이 프로젝트의 `assets` 폴더 내에 올바르게 위치해 있는지 확인하거나, `@thinksys/react-native-mediapipe` 설정 가이드에 따라 적절하게 구성되어 있는지 확인합니다.

## 앱 실행 (Running the App)

Expo 개발 서버를 시작합니다:

```bash
npx expo start
```

터미널 출력 화면에서 다음 옵션 중 하나를 선택하여 앱을 실행할 수 있습니다:
- 안드로이드 에뮬레이터 열기 (`a` 키 입력)
- iOS 시뮬레이터 열기 (`i` 키 입력)
- 기기의 카메라로 QR 코드를 스캔하여 Expo Go 앱에서 열기

## 기술 스택 (Tech Stack)

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [React Native Vision Camera](https://mrousavy.com/react-native-vision-camera/)
- [MediaPipe for React Native](https://github.com/thinksys/react-native-mediapipe)
- [React Native Worklets Core](https://github.com/margelo/react-native-worklets-core)

## 프로젝트 구조 (Project Structure)

- `app/`: 파일 기반 라우팅 컴포넌트를 포함합니다 (Expo Router).
  - `index.tsx`: 메인 홈 화면 진입점.
  - `live-feedback/`: 카메라 피드와 포즈 시각화를 처리하는 주요 기능 디렉토리.
- `assets/`: 정적 파일, 이미지 및 모델 파일(예: MediaPipe `.task` 파일)을 보관합니다.
- `components/`: 재사용 가능한 UI 컴포넌트를 보관합니다.

## 스크립트 명령어 (Scripts)

- `npm start`: Expo Metro 번들러를 시작합니다.
- `npm run android`: 안드로이드 기기 또는 에뮬레이터에서 앱을 실행합니다.
- `npm run ios`: iOS 기기 또는 시뮬레이터에서 앱을 실행합니다.
- `npm run web`: 웹 버전의 애플리케이션을 시작합니다.
- `npm run lint`: ESLint를 실행하여 코드의 문제점을 검사합니다.
