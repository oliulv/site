interface HeaderProps {
  selectedNavIndex: number;
  onTabClick: (page: "about" | "links") => void;
}

const TABS: { label: string; page: "about" | "links" }[] = [
  { label: "About", page: "about" },
  { label: "Links", page: "links" },
];

const EQUATION = "[1.01\u00B3\u2076\u2075 = 37.8]  >  [0.99\u00B3\u2076\u2075 = 0.03]";

export function Header({ selectedNavIndex, onTabClick }: HeaderProps) {
  return (
    <div className="header">
      <div className="header-tabs">
        {TABS.map((tab, index) => (
          <span
            key={tab.page}
            className={`header-tab ${index === selectedNavIndex ? "active" : ""}`}
            onClick={() => onTabClick(tab.page)}
          >
            {tab.label}
          </span>
        ))}
      </div>
      <div className="header-equation">{EQUATION}</div>
    </div>
  );
}
