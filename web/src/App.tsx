import { useAppState } from "./hooks/useAppState";
import { LoadingScreen } from "./components/LoadingScreen";
import { Header } from "./components/Header";
import { AboutPage } from "./components/AboutPage";
import "./App.css";

export default function App() {
  const state = useAppState();

  if (state.phase === "loading") {
    return (
      <div className="app">
        <LoadingScreen spinnerFrame={state.spinnerFrame} />
      </div>
    );
  }

  return (
    <div className="app">
      {state.chromeVisible && <Header />}
      <div className="main-content">
        <AboutPage
          typewriterIndex={state.typewriterIndex}
          cursorVisible={state.cursorVisible}
          mapRevealIndex={state.mapRevealIndex}
        />
      </div>
    </div>
  );
}
