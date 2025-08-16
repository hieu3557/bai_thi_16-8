import { useEffect, useState } from "react";
import { apiService } from "../services/apiService";
import "./Dashboard.css";

/**
 * Dashboard component provides an overview of the entire game system
 * This demonstrates data aggregation and summary displays
 */
const Dashboard = () => {
  const [systemStats, setSystemStats] = useState({
    totalPlayers: 0,
    totalAssets: 0,
    totalAssignments: 0,
    averagePlayerLevel: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState("unknown");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);

    try {
      // Check server health
      const healthResult = await apiService.checkHealth();
      setServerStatus(healthResult.success ? "online" : "offline");

      // Load player assets data for statistics
      const playerAssetsResult = await apiService.getPlayerAssets();

      if (playerAssetsResult.success) {
        const data = playerAssetsResult.data;

        // Calculate statistics
        const uniquePlayers = new Set(data.map((item) => item.playerName));
        const uniqueAssets = new Set(data.map((item) => item.assetName));
        const totalLevels = data.reduce((sum, item) => sum + item.level, 0);

        setSystemStats({
          totalPlayers: uniquePlayers.size,
          totalAssets: uniqueAssets.size,
          totalAssignments: data.length,
          averagePlayerLevel:
            uniquePlayers.size > 0 ? Math.round(totalLevels / data.length) : 0,
        });

        // Create recent activity simulation (in real app, this would come from backend)
        setRecentActivity([
          {
            action: "Player registered",
            details: "New players in the system",
            count: uniquePlayers.size,
          },
          {
            action: "Assets created",
            details: "Available game items",
            count: uniqueAssets.size,
          },
          {
            action: "Assets assigned",
            details: "Player-asset relationships",
            count: data.length,
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      setServerStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard">
        <div className="loading-dashboard">
          <div className="spinner-large"></div>
          <h3>Loading Dashboard...</h3>
          <p>Gathering system statistics and activity data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>🏠 System Dashboard</h2>
        <p>Overview of your BattleGame management system</p>
        <div className={`server-status ${serverStatus}`}>
          <span className="status-indicator"></span>
          <span>
            Server Status:{" "}
            {serverStatus.charAt(0).toUpperCase() + serverStatus.slice(1)}
          </span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card players">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{systemStats.totalPlayers}</h3>
            <p>Registered Players</p>
          </div>
        </div>

        <div className="stat-card assets">
          <div className="stat-icon">⚔️</div>
          <div className="stat-info">
            <h3>{systemStats.totalAssets}</h3>
            <p>Available Assets</p>
          </div>
        </div>

        <div className="stat-card assignments">
          <div className="stat-icon">🔗</div>
          <div className="stat-info">
            <h3>{systemStats.totalAssignments}</h3>
            <p>Asset Assignments</p>
          </div>
        </div>

        <div className="stat-card level">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>{systemStats.averagePlayerLevel}</h3>
            <p>Average Player Level</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="activity-section">
          <h3>📈 System Activity</h3>
          <div className="activity-list">
            {recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-info">
                  <span className="activity-action">{activity.action}</span>
                  <span className="activity-details">{activity.details}</span>
                </div>
                <div className="activity-count">{activity.count}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="quick-actions">
          <h3>⚡ Quick Actions</h3>
          <div className="action-buttons">
            <button className="action-btn register">
              <span className="action-icon">👤</span>
              <span>Register Player</span>
            </button>
            <button className="action-btn create">
              <span className="action-icon">⚔️</span>
              <span>Create Asset</span>
            </button>
            <button className="action-btn assign">
              <span className="action-icon">🎯</span>
              <span>Assign Asset</span>
            </button>
            <button className="action-btn report">
              <span className="action-icon">📊</span>
              <span>View Report</span>
            </button>
          </div>
        </div>
      </div>

      <div className="system-info">
        <h3>ℹ️ System Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Backend API:</span>
            <span className="info-value">ASP.NET Core Web API</span>
          </div>
          <div className="info-item">
            <span className="info-label">Database:</span>
            <span className="info-value">MongoDB</span>
          </div>
          <div className="info-item">
            <span className="info-label">Frontend:</span>
            <span className="info-value">React.js</span>
          </div>
          <div className="info-item">
            <span className="info-label">API Endpoint:</span>
            <span className="info-value">http://localhost:5000/api</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
