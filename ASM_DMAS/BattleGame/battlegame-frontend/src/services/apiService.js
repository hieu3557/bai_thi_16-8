import axios from "axios";

/**
 * Centralized API service for all backend communications
 * This service layer abstracts HTTP calls and provides consistent error handling
 * Think of this as your frontend's "translator" for talking to the backend
 */

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Set timeout to 10 seconds - adjust based on your needs
  timeout: 10000,
});

// Request interceptor for logging (helpful during development)
apiClient.interceptors.request.use(
  (config) => {
    console.log(
      `🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`,
      config.data
    );
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for consistent error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(
      `✅ API Response: ${response.config.method?.toUpperCase()} ${
        response.config.url
      }`,
      response.data
    );
    return response;
  },
  (error) => {
    console.error("❌ Response Error:", error.response?.data || error.message);

    // You can add global error handling here
    // For example, redirect to login page on 401 errors
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.warn("Unauthorized access detected");
    }

    return Promise.reject(error);
  }
);

/**
 * API service methods - each method corresponds to a backend endpoint
 * These methods provide a clean interface for your React components
 */
export const apiService = {
  // Player-related operations
  async registerPlayer(playerData) {
    try {
      const response = await apiClient.post("/game/registerplayer", playerData);
      return {
        success: true,
        data: response.data,
        message: "Player registered successfully!",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to register player",
        details: error.response?.data,
      };
    }
  },

  // Get all players (not just those with assets)
  async getAllPlayersComplete() {
    try {
      const response = await apiClient.get("/game/players");
      return {
        success: true,
        data: response.data.data || [],
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch players",
        details: error.response?.data,
      };
    }
  },

  // Get all assets (not just those assigned to players)
  async getAllAssetsComplete() {
    try {
      const response = await apiClient.get("/game/assets");
      return {
        success: true,
        data: response.data.data || [],
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch assets",
        details: error.response?.data,
      };
    }
  },

  // Updated assign asset method that actually works
  async assignAssetToPlayer(playerId, assetId) {
    try {
      const response = await apiClient.post("/game/assignasset", {
        playerId,
        assetId,
      });
      return {
        success: true,
        data: response.data,
        message: "Asset assigned successfully!",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to assign asset",
        details: error.response?.data,
      };
    }
  },

  // Asset-related operations
  async createAsset(assetData) {
    try {
      const response = await apiClient.post("/game/createasset", assetData);
      return {
        success: true,
        data: response.data,
        message: "Asset created successfully!",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to create asset",
        details: error.response?.data,
      };
    }
  },

  // Player-Asset relationship operations
  async assignAsset(playerId, assetId) {
    try {
      const response = await apiClient.post("/game/assignasset", {
        playerId,
        assetId,
      });
      return {
        success: true,
        data: response.data,
        message: "Asset assigned successfully!",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to assign asset",
        details: error.response?.data,
      };
    }
  },

  async getPlayerAssets() {
    try {
      const response = await apiClient.get("/game/getassetsbyplayer");
      return {
        success: true,
        data: response.data.data || [],
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch player assets",
        details: error.response?.data,
      };
    }
  },

  // Health check
  async checkHealth() {
    try {
      const response = await apiClient.get("/health");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          "API server is not responding. Make sure your backend is running on port 5000.",
      };
    }
  },
};

export default apiService;
