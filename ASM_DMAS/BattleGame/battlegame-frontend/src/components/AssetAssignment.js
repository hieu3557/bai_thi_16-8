import { useEffect, useState } from "react";
import { apiService } from "../services/apiService";
import "./AssetAssignment.css";

/**
 * AssetAssignment component provides an interface for assigning assets to players
 * This demonstrates complex state management and multi-step user interactions
 */
const AssetAssignment = () => {
  const [players, setPlayers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [selectedAsset, setSelectedAsset] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  /**
   * Load initial data when component mounts
   * This demonstrates data fetching for dependent dropdowns
   */
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // Load ALL players and ALL assets using the new endpoints
      const [playersResult, assetsResult] = await Promise.all([
        apiService.getAllPlayersComplete(),
        apiService.getAllAssetsComplete(),
      ]);

      if (playersResult.success) {
        setPlayers(playersResult.data);
      } else {
        console.error("Failed to load players:", playersResult.error);
      }

      if (assetsResult.success) {
        setAssets(assetsResult.data);
      } else {
        console.error("Failed to load assets:", assetsResult.error);
      }

      // If either request failed, show an appropriate message
      if (!playersResult.success || !assetsResult.success) {
        setMessage({
          type: "warning",
          text: "Some data could not be loaded. Please ensure your API server is running and try refreshing.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to load players and assets. Please ensure your API server is running.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayerSelect = (playerName) => {
    setSelectedPlayer(playerName);
    if (message.text) {
      setMessage({ type: "", text: "" });
    }
  };

  const handleAssetSelect = (assetName) => {
    setSelectedAsset(assetName);
    if (message.text) {
      setMessage({ type: "", text: "" });
    }
  };

  /**
   * Handle asset assignment with validation
   * This demonstrates complex business logic validation on the frontend
   */
  const handleAssignment = async () => {
    if (!selectedPlayer || !selectedAsset) {
      setMessage({
        type: "error",
        text: "Please select both a player and an asset before assigning.",
      });
      return;
    }

    setIsAssigning(true);
    setMessage({ type: "", text: "" });

    try {
      // Find the selected player and asset objects to get their IDs
      const playerObj = players.find((p) => p.playerName === selectedPlayer);
      const assetObj = assets.find((a) => a.assetName === selectedAsset);

      if (!playerObj || !assetObj) {
        throw new Error("Could not find player or asset information");
      }

      // Check level requirement before attempting assignment
      if (playerObj.level < assetObj.levelRequire) {
        setMessage({
          type: "error",
          text: `❌ ${playerObj.playerName} (Level ${playerObj.level}) does not meet the level requirement (${assetObj.levelRequire}) for "${assetObj.assetName}"`,
        });
        setIsAssigning(false);
        return;
      }

      // Make the actual API call
      const result = await apiService.assignAssetToPlayer(
        playerObj.playerId,
        assetObj.assetId
      );

      if (result.success) {
        setMessage({
          type: "success",
          text: `🎉 Successfully assigned "${selectedAsset}" to "${selectedPlayer}"!`,
        });

        // Clear selections after successful assignment
        setSelectedPlayer("");
        setSelectedAsset("");

        // Optionally refresh the data to show updated assignments
        // This ensures the dashboard and reports reflect the new assignment
        setTimeout(() => {
          // You could trigger a data refresh here if needed
          console.log("Assignment completed successfully");
        }, 1000);
      } else {
        setMessage({
          type: "error",
          text: `❌ Assignment failed: ${result.error}`,
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: `❌ Unexpected error during assignment: ${error.message}`,
      });
    } finally {
      setIsAssigning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="asset-assignment">
        <div className="loading-state">
          <div className="spinner-large"></div>
          <h3>Loading Players and Assets...</h3>
          <p>Gathering available players and assets for assignment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="asset-assignment">
      <div className="form-header">
        <h2>🎯 Assign Assets to Players</h2>
        <p>
          Connect players with the perfect equipment for their adventure level.
        </p>
      </div>

      {players.length === 0 || assets.length === 0 ? (
        <div className="no-data-state">
          <h3>📋 Setup Required</h3>
          <p>
            To assign assets, you need both players and assets in your system.
          </p>
          <div className="setup-checklist">
            <div
              className={`checklist-item ${
                players.length > 0 ? "complete" : "incomplete"
              }`}
            >
              <span className="check-icon">
                {players.length > 0 ? "✅" : "❌"}
              </span>
              <span>Players registered: {players.length}</span>
            </div>
            <div
              className={`checklist-item ${
                assets.length > 0 ? "complete" : "incomplete"
              }`}
            >
              <span className="check-icon">
                {assets.length > 0 ? "✅" : "❌"}
              </span>
              <span>Assets created: {assets.length}</span>
            </div>
          </div>
          <p>
            Use the "Register Player" and "Create Asset" sections to add data
            first.
          </p>
        </div>
      ) : (
        <div className="assignment-interface">
          {/* Player Selection */}
          <div className="selection-section">
            <h3>👤 Select Player</h3>
            <div className="player-grid">
              {players.map((player) => (
                <button
                  key={player.playerName}
                  className={`player-card ${
                    selectedPlayer === player.playerName ? "selected" : ""
                  }`}
                  onClick={() => handlePlayerSelect(player.playerName)}
                  disabled={isAssigning}
                >
                  <div className="player-info">
                    <span className="player-name">{player.playerName}</span>
                    <div className="player-stats">
                      <span className="level-badge">Level {player.level}</span>
                      <span className="age-info">Age {player.age}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Asset Selection */}
          <div className="selection-section">
            <h3>⚔️ Select Asset</h3>
            <div className="asset-grid">
              {assets.map((asset) => (
                <button
                  key={asset.assetName}
                  className={`asset-card ${
                    selectedAsset === asset.assetName ? "selected" : ""
                  }`}
                  onClick={() => handleAssetSelect(asset.assetName)}
                  disabled={isAssigning}
                >
                  <div className="asset-info">
                    <span className="asset-name">{asset.assetName}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Assignment Preview */}
          {selectedPlayer && selectedAsset && (
            <div className="assignment-preview">
              <h3>📋 Assignment Preview</h3>
              <div className="preview-content">
                <div className="preview-item">
                  <span className="preview-label">Player:</span>
                  <span className="preview-value">{selectedPlayer}</span>
                </div>
                <div className="arrow">➡️</div>
                <div className="preview-item">
                  <span className="preview-label">Asset:</span>
                  <span className="preview-value">{selectedAsset}</span>
                </div>
              </div>
            </div>
          )}

          {/* Assignment Button */}
          <button
            className="assign-button"
            onClick={handleAssignment}
            disabled={!selectedPlayer || !selectedAsset || isAssigning}
          >
            {isAssigning ? (
              <>
                <span className="spinner"></span>
                Assigning Asset...
              </>
            ) : (
              <>✨ Assign Asset</>
            )}
          </button>

          {/* Message Display */}
          {message.text && (
            <div className={`message ${message.type}`}>{message.text}</div>
          )}
        </div>
      )}

      <div className="assignment-tips">
        <h3>💡 Assignment Guidelines</h3>
        <div className="tips-list">
          <div className="tip-item">
            <span className="tip-icon">⚖️</span>
            <span>Ensure player level meets asset requirements</span>
          </div>
          <div className="tip-item">
            <span className="tip-icon">🎯</span>
            <span>
              Consider the player's current equipment before assigning
            </span>
          </div>
          <div className="tip-item">
            <span className="tip-icon">📈</span>
            <span>Higher level assets provide better capabilities</span>
          </div>
          <div className="tip-item">
            <span className="tip-icon">🔄</span>
            <span>Assets can be reassigned to different players as needed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetAssignment;
