import { useCallback, useEffect, useMemo, useState } from "react";

type Scene = {
  id: string;
  image: string;
  speaker: string;
  text: string;
  durationMs: number;
  cropBakedUi?: boolean;
};

type AppScreen = "opening" | "start" | "selection";

const OPENING_SCENES: Scene[] = [
  {
    id: "dark-room",
    image: "/opening/01-dark-room.png",
    speaker: "소봉이",
    text: "나는 23년째 모태솔로다....",
    durationMs: 4100,
    cropBakedUi: true
  },
  {
    id: "rain-street",
    image: "/opening/02-rain-street.png",
    speaker: "소봉이",
    text: "그날도 비가 왔다. 우산 아래에는 나 혼자뿐이었다.",
    durationMs: 5200,
    cropBakedUi: true
  },
  {
    id: "truck",
    image: "/opening/03-truck.png",
    speaker: "소봉이",
    text: "눈앞의 불빛이 비를 찢고 달려왔다.",
    durationMs: 4700
  },
  {
    id: "fall",
    image: "/opening/04-fall.png",
    speaker: "소봉이",
    text: "몸이 붕 떠오른 순간, 시간이 이상할 만큼 느려졌다.",
    durationMs: 5200
  }
];

const GIRLFRIEND_CARDS = [
  {
    name: "소윤",
    tone: "조심스러운 현실주의자",
    delay: "답장은 느리지만 말의 온도를 오래 본다."
  },
  {
    name: "하린",
    tone: "차분한 커리어형",
    delay: "가볍지 않은 태도와 책임감을 중시한다."
  },
  {
    name: "민서",
    tone: "애정 확인형",
    delay: "빠른 반응과 분명한 표현에 안심한다."
  }
];

export default function App() {
  const [screen, setScreen] = useState<AppScreen>("opening");

  if (screen === "opening") {
    return <OpeningSequence onComplete={() => setScreen("start")} />;
  }

  if (screen === "selection") {
    return <SelectionScreen onReplay={() => setScreen("opening")} />;
  }

  return (
    <StartScreen
      onReplay={() => setScreen("opening")}
      onStart={() => setScreen("selection")}
    />
  );
}

function OpeningSequence({ onComplete }: { onComplete: () => void }) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [typedLength, setTypedLength] = useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();
  const scene = OPENING_SCENES[sceneIndex];
  const visibleTextLength = prefersReducedMotion ? scene.text.length : typedLength;
  const typedText = useMemo(
    () => scene.text.slice(0, visibleTextLength),
    [scene.text, visibleTextLength]
  );
  const isLastScene = sceneIndex === OPENING_SCENES.length - 1;

  const finishOpening = useCallback(() => {
    onComplete();
  }, [onComplete]);

  const advance = useCallback(() => {
    if (visibleTextLength < scene.text.length) {
      setTypedLength(scene.text.length);
      return;
    }

    if (isLastScene) {
      finishOpening();
      return;
    }

    setSceneIndex((current) => current + 1);
  }, [finishOpening, isLastScene, scene.text.length, visibleTextLength]);

  useEffect(() => {
    setTypedLength(prefersReducedMotion ? scene.text.length : 0);
  }, [prefersReducedMotion, scene.text.length, sceneIndex]);

  useEffect(() => {
    if (prefersReducedMotion) {
      return undefined;
    }

    if (typedLength >= scene.text.length) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setTypedLength((current) => Math.min(current + 1, scene.text.length));
    }, 38);

    return () => window.clearTimeout(timeoutId);
  }, [prefersReducedMotion, scene.text.length, typedLength]);

  useEffect(() => {
    const timeoutId = window.setTimeout(advance, scene.durationMs);
    return () => window.clearTimeout(timeoutId);
  }, [advance, scene.durationMs]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        finishOpening();
        return;
      }

      if (
        (event.key === "Enter" || event.key === " ") &&
        !(event.target instanceof HTMLButtonElement)
      ) {
        event.preventDefault();
        advance();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [advance, finishOpening]);

  return (
    <main
      className="opening-stage"
      onClick={advance}
      aria-label="게임 오프닝"
    >
      <button
        className="stage-advance"
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          advance();
        }}
        aria-label={
          visibleTextLength < scene.text.length
            ? "대사 전체 보기"
            : isLastScene
              ? "오프닝 종료"
              : "다음 장면 보기"
        }
      />
      <FrameImage scene={scene} />
      <button
        className="skip-button"
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          finishOpening();
        }}
      >
        스킵하기
      </button>
      <DialogueBox speaker={scene.speaker} text={typedText} />
    </main>
  );
}

function StartScreen({
  onReplay,
  onStart
}: {
  onReplay: () => void;
  onStart: () => void;
}) {
  return (
    <main className="opening-stage start-stage">
      <img
        className="frame-image"
        src="/opening/02-rain-street.png"
        alt=""
        draggable="false"
      />
      <div className="start-shade" aria-hidden="true" />
      <section className="start-copy" aria-labelledby="start-title">
        <p className="chapter-label">DAY 1</p>
        <h1 id="start-title">병원에서 첫 연락</h1>
        <p>
          비가 그치면 세 개의 메시지가 도착한다. 어느 한 사람을 고르는 순간,
          1일차가 시작된다.
        </p>
        <div className="start-actions">
          <button className="primary-action" type="button" onClick={onStart}>
            시작하기
          </button>
          <button className="secondary-action" type="button" onClick={onReplay}>
            다시 보기
          </button>
        </div>
      </section>
    </main>
  );
}

function SelectionScreen({ onReplay }: { onReplay: () => void }) {
  const [selectedName, setSelectedName] = useState(GIRLFRIEND_CARDS[0].name);

  return (
    <main className="selection-screen">
      <div className="selection-background" aria-hidden="true" />
      <section className="selection-header" aria-labelledby="selection-title">
        <p className="chapter-label">FIRST CONTACT</p>
        <h1 id="selection-title">누구에게 답장을 보낼까?</h1>
        <p>처음의 한 문장이 관계의 속도를 결정한다.</p>
      </section>

      <section className="selection-grid" aria-label="캐릭터 선택">
        {GIRLFRIEND_CARDS.map((card) => (
          <button
            className={`girlfriend-card ${
              selectedName === card.name ? "selected" : ""
            }`}
            key={card.name}
            type="button"
            onClick={() => setSelectedName(card.name)}
          >
            <span>{card.name}</span>
            <strong>{card.tone}</strong>
            <small>{card.delay}</small>
          </button>
        ))}
      </section>

      <div className="selection-footer">
        <p>{selectedName}에게 첫 메시지를 보낼 준비가 됐다.</p>
        <button className="secondary-action" type="button" onClick={onReplay}>
          오프닝 다시 보기
        </button>
      </div>
    </main>
  );
}

function FrameImage({ scene }: { scene: Scene }) {
  return (
    <img
      className={`frame-image ${scene.cropBakedUi ? "crop-baked-ui" : ""}`}
      src={scene.image}
      alt=""
      draggable="false"
    />
  );
}

function DialogueBox({ speaker, text }: { speaker: string; text: string }) {
  return (
    <section className="dialogue-wrap" aria-live="polite">
      <div className="speaker-tag">
        <span>{speaker}</span>
      </div>
      <p className="dialogue-text">
        {text}
        <span className="type-caret" aria-hidden="true" />
      </p>
      <span className="next-glyph" aria-hidden="true" />
    </section>
  );
}

function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}
