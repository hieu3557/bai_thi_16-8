import "./Navigation.css";

/**
 * Navigation component that provides a clean interface for switching between app sections
 * This component demonstrates how to manage application state and user navigation
 */
const Navigation = ({ currentView, onViewChange }) => {
  const navigationItems = [
    {
      key: "dashboard",
      label: "🏠 Dashboard",
      description: "Overview of your game system",
    },
    {
      key: "players",
      label: "👤 Register Player",
      description: "Add new players to the game",
    },
    {
      key: "assets",
      label: "⚔️ Create Asset",
      description: "Create new game items and equipment",
    },
    {
      key: "assign",
      label: "🎯 Assign Assets",
      description: "Give assets to players",
    },
    {
      key: "report",
      label: "📊 View Report",
      description: "See all player assets",
    },
  ];

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <h1>🎮 BattleGame Admin</h1>
        <p>Game Management System</p>
      </div>

      <div className="nav-items">
        {navigationItems.map((item) => (
          <button
            key={item.key}
            className={`nav-item ${currentView === item.key ? "active" : ""}`}
            onClick={() => onViewChange(item.key)}
            title={item.description}
          >
            <span className="nav-label">{item.label}</span>
            <small className="nav-description">{item.description}</small>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
