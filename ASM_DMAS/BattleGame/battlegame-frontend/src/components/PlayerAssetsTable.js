import axios from "axios";
import { useEffect, useState } from "react";
import "./PlayerAssetsTable.css";

/**
 * PlayerAssetsTable component fetches and displays player asset data
 * This demonstrates React hooks, HTTP requests, and state management
 */
const PlayerAssetsTable = () => {
  // State management using React hooks
  // useState returns [currentValue, setterFunction]
  const [playerAssets, setPlayerAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configuration for API endpoints
  // In production, this would come from environment variables
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

  // useEffect hook runs after component mounts and when dependencies change
  // Empty dependency array means this runs only once when component mounts
  useEffect(() => {
    fetchPlayerAssets();
  }, []);

  /**
   * Fetches player assets data from the API
   * This function demonstrates async/await pattern and error handling
   */
  const fetchPlayerAssets = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(
        "Fetching player assets from:",
        `${API_BASE_URL}/game/getassetsbyplayer`
      );

      // Make HTTP GET request to your API
      const response = await axios.get(
        `${API_BASE_URL}/game/getassetsbyplayer`
      );

      console.log("API response:", response.data);

      // Check if the API returned success
      if (response.data.success) {
        setPlayerAssets(response.data.data);
      } else {
        setError("API returned unsuccessful response");
      }
    } catch (err) {
      console.error("Error fetching player assets:", err);

      // Provide user-friendly error messages based on error type
      if (
        err.code === "ECONNREFUSED" ||
        err.message.includes("Network Error")
      ) {
        setError(
          "Cannot connect to the server. Make sure your API is running on port 5000."
        );
      } else if (err.response) {
        // Server responded with error status
        setError(
          `Server error: ${err.response.status} - ${
            err.response.data?.message || err.response.statusText
          }`
        );
      } else {
        // Network error or other issue
        setError("An unexpected error occurred while fetching data.");
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles refresh button clicks
   * This allows users to manually reload data
   */
  const handleRefresh = () => {
    fetchPlayerAssets();
  };

  // Render loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading player assets...</p>
        <small>Make sure your API server is running on port 5000</small>
      </div>
    );
  }

  // Render error state with helpful troubleshooting information
  if (error) {
    return (
      <div className="error-container">
        <h3>Error Loading Data</h3>
        <p>{error}</p>
        <div className="troubleshooting">
          <h4>Troubleshooting Steps:</h4>
          <ol>
            <li>
              Ensure your API server is running: <code>dotnet run</code> in the
              BattleGame.Api directory
            </li>
            <li>
              Check that the API is accessible at:{" "}
              <code>http://localhost:5000/health</code>
            </li>
            <li>Verify MongoDB is running and accessible</li>
            <li>Check browser console for additional error details</li>
          </ol>
        </div>
        <button onClick={handleRefresh} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  // Render the main table interface
  return (
    <div className="player-assets-container">
      <div className="header">
        <h2>Player Assets Report</h2>
        <div className="header-actions">
          <button onClick={handleRefresh} className="refresh-button">
            🔄 Refresh Data
          </button>
          <span className="record-count">
            {playerAssets.length} record{playerAssets.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Show helpful message when no data is available */}
      {playerAssets.length === 0 ? (
        <div className="no-data">
          <h3>No Player Assets Found</h3>
          <p>To see data in this table, you need to:</p>
          <ol>
            <li>
              <strong>Register some players</strong> using the API endpoint:{" "}
              <code>POST /api/game/registerplayer</code>
            </li>
            <li>
              <strong>Create some assets</strong> using the API endpoint:{" "}
              <code>POST /api/game/createasset</code>
            </li>
            <li>
              <strong>Assign assets to players</strong> using the API endpoint:{" "}
              <code>POST /api/game/assignasset</code>
            </li>
          </ol>
          <p>
            You can test these endpoints using the Swagger UI at:{" "}
            <a
              href="http://localhost:5000"
              target="_blank"
              rel="noopener noreferrer"
            >
              http://localhost:5000
            </a>
          </p>
        </div>
      ) : (
        <>
          {/* Main data table */}
          <div className="table-container">
            <table className="player-assets-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Player Name</th>
                  <th>Level</th>
                  <th>Age</th>
                  <th>Asset Name</th>
                </tr>
              </thead>
              <tbody>
                {playerAssets.map((asset, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "even-row" : "odd-row"}
                  >
                    <td>{asset.no}</td>
                    <td className="player-name">{asset.playerName}</td>
                    <td className="level">
                      <span className="level-badge">Lv. {asset.level}</span>
                    </td>
                    <td>{asset.age}</td>
                    <td className="asset-name">{asset.assetName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table footer with summary information */}
          <div className="table-footer">
            <p>
              Showing {playerAssets.length} player asset assignment
              {playerAssets.length !== 1 ? "s" : ""}
            </p>
            <small>Last updated: {new Date().toLocaleString()}</small>
          </div>
        </>
      )}
    </div>
  );
};

export default PlayerAssetsTable;
