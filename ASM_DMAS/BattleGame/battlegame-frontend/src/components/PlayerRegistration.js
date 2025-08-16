import { useState } from "react";
import { apiService } from "../services/apiService";
import "./PlayerRegistration.css";

/**
 * PlayerRegistration component provides a form for creating new players
 * This demonstrates form handling, validation, and API integration
 */
const PlayerRegistration = () => {
  // Form state management - each field gets its own state
  const [formData, setFormData] = useState({
    playerName: "",
    fullName: "",
    age: "",
    level: "",
    email: "",
  });

  // UI state management for loading, success, and error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  /**
   * Handles input changes and updates form state
   * This pattern ensures controlled components where React manages all form data
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear any existing messages when user starts typing
    if (message.text) {
      setMessage({ type: "", text: "" });
    }
  };

  /**
   * Validates form data before submission
   * Client-side validation provides immediate feedback to users
   */
  const validateForm = () => {
    const errors = [];

    if (!formData.playerName.trim()) {
      errors.push("Player name is required");
    } else if (formData.playerName.length < 3) {
      errors.push("Player name must be at least 3 characters long");
    }

    if (!formData.fullName.trim()) {
      errors.push("Full name is required");
    }

    const age = parseInt(formData.age);
    if (!age || age < 13 || age > 100) {
      errors.push("Age must be between 13 and 100");
    }

    const level = parseInt(formData.level);
    if (!level || level < 1 || level > 100) {
      errors.push("Level must be between 1 and 100");
    }

    if (!formData.email.trim()) {
      errors.push("Email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push("Please enter a valid email address");
    }

    return errors;
  };

  /**
   * Handles form submission with validation and API call
   * This demonstrates proper async form handling with error management
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setMessage({
        type: "error",
        text: validationErrors.join(". "),
      });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      // Convert string inputs to appropriate types
      const playerData = {
        ...formData,
        age: parseInt(formData.age),
        level: parseInt(formData.level),
      };

      // Call API service
      const result = await apiService.registerPlayer(playerData);

      if (result.success) {
        setMessage({
          type: "success",
          text: `🎉 ${result.message} Player "${formData.playerName}" has been registered successfully!`,
        });

        // Reset form after successful submission
        setFormData({
          playerName: "",
          fullName: "",
          age: "",
          level: "",
          email: "",
        });
      } else {
        setMessage({
          type: "error",
          text: `❌ ${result.error}`,
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: `❌ Unexpected error: ${error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="player-registration">
      <div className="form-header">
        <h2>👤 Register New Player</h2>
        <p>
          Add a new player to the BattleGame system. All fields are required.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="registration-form">
        <div className="form-group">
          <label htmlFor="playerName">
            Player Name *
            <span className="field-hint">
              Unique username for the game (3+ characters)
            </span>
          </label>
          <input
            type="text"
            id="playerName"
            name="playerName"
            value={formData.playerName}
            onChange={handleInputChange}
            placeholder="e.g., DragonSlayer99"
            maxLength="50"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="fullName">
            Full Name *
            <span className="field-hint">Player's real full name</span>
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="e.g., John Smith"
            maxLength="100"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="age">
              Age *<span className="field-hint">13-100 years old</span>
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              placeholder="25"
              min="13"
              max="100"
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="level">
              Starting Level *<span className="field-hint">1-100</span>
            </label>
            <input
              type="number"
              id="level"
              name="level"
              value={formData.level}
              onChange={handleInputChange}
              placeholder="1"
              min="1"
              max="100"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">
            Email Address *
            <span className="field-hint">
              Valid email for account verification
            </span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="john.smith@example.com"
            maxLength="100"
            disabled={isSubmitting}
          />
        </div>

        {/* Message display area */}
        {message.text && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}

        {/* Submit button with loading state */}
        <button type="submit" className="submit-button" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="spinner"></span>
              Registering Player...
            </>
          ) : (
            <>✨ Register Player</>
          )}
        </button>
      </form>

      <div className="form-tips">
        <h3>💡 Tips for Registration</h3>
        <ul>
          <li>
            Choose a unique player name that other players will recognize you by
          </li>
          <li>Starting level can be adjusted later as the player progresses</li>
          <li>
            Email addresses must be unique and will be used for account recovery
          </li>
          <li>
            All player data can be updated through the admin interface after
            registration
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PlayerRegistration;
