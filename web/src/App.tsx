import { useAppState } from "./hooks/useAppState";
import { LoadingScreen } from "./components/LoadingScreen";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { AboutPage } from "./components/AboutPage";
import { LinksPage } from "./components/LinksPage";
import "./App.css";

const VERSION = "0.0.1";

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
      {state.chromeVisible && (
        <Header
          selectedNavIndex={state.selectedNavIndex}
          onTabClick={state.setCurrentPage}
        />
      )}
      <div className="main-content">
        {state.currentPage === "about" ? (
          <AboutPage
            typewriterIndex={state.typewriterIndex}
            cursorVisible={state.cursorVisible}
            mapRevealIndex={state.mapRevealIndex}
          />
        ) : (
          <LinksPage
            selectedLinkIndex={state.selectedLinkIndex}
            onSelectLink={state.setSelectedLinkIndex}
          />
        )}
      </div>
      {state.chromeVisible && (
        <Footer
          version={VERSION}
          linksPageActive={state.currentPage === "links"}
        />
      )}
    </div>
  );
}
