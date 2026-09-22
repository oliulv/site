const EQUATION = "[1.01³⁶⁵ = 37.8]  >  [0.99³⁶⁵ = 0.03]";

export function Header() {
  return (
    <div className="header">
      <div className="header-tabs">
        <span className="header-tab">About</span>
      </div>
      <div className="header-equation">{EQUATION}</div>
    </div>
  );
}
