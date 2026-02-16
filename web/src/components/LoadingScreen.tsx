const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

interface LoadingScreenProps {
  spinnerFrame: number;
}

export function LoadingScreen({ spinnerFrame }: LoadingScreenProps) {
  const frame = SPINNER_FRAMES[spinnerFrame % SPINNER_FRAMES.length];

  return (
    <div className="loading-screen">
      <span className="spinner">{frame}</span>
      <span className="loading-text">Loading ...</span>
    </div>
  );
}
