import { useState } from "react";
import "./App.css";
import AssetAssignment from "./components/AssetAssignment";
import AssetCreation from "./components/AssetCreation";
import Dashboard from "./components/Dashboard";
import Navigation from "./components/Navigation";
import PlayerAssetsTable from "./components/PlayerAssetsTable";
import PlayerRegistration from "./components/PlayerRegistration";

/**
 * Main App component that manages navigation between different views
 * This demonstrates React's component composition and state management patterns
 */
function App() {
  const [currentView, setCurrentView] = useState("dashboard");

  /**
   * Renders the appropriate component based on current view
   * This pattern allows for clean navigation without external routing libraries
   */
  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard />;
      case "players":
        return <PlayerRegistration />;
      case "assets":
        return <AssetCreation />;
      case "assign":
        return <AssetAssignment />;
      case "report":
        return <PlayerAssetsTable />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="App">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />

      <main className="App-main">{renderCurrentView()}</main>

      <footer className="App-footer">
        <p>
          🎮 BattleGame Management System • Built with ASP.NET Core, MongoDB,
          and React
        </p>
        <div className="footer-links">
          <a
            href="http://localhost:5000"
            target="_blank"
            rel="noopener noreferrer"
            className="api-link"
          >
            📚 API Documentation
          </a>
          <span className="separator">•</span>
          <a
            href="http://localhost:5000/health"
            target="_blank"
            rel="noopener noreferrer"
            className="health-link"
          >
            ❤️ Health Check
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
