import { useState } from "react";
import { apiService } from "../services/apiService";
import "./AssetCreation.css";

/**
 * AssetCreation component provides a form for creating new game assets
 * This demonstrates complex form handling with different input types and validation
 */
const AssetCreation = () => {
  const [formData, setFormData] = useState({
    assetName: "",
    levelRequire: "",
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Predefined asset categories for better UX
  const assetCategories = [
    { name: "Weapon", icon: "⚔️", examples: "Swords, Bows, Staffs" },
    { name: "Armor", icon: "🛡️", examples: "Helmets, Chestplates, Shields" },
    { name: "Accessory", icon: "💍", examples: "Rings, Amulets, Charms" },
    { name: "Consumable", icon: "🧪", examples: "Potions, Scrolls, Food" },
    { name: "Tool", icon: "🔧", examples: "Pickaxes, Fishing Rods, Keys" },
    { name: "Special", icon: "✨", examples: "Artifacts, Relics, Crystals" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (message.text) {
      setMessage({ type: "", text: "" });
    }
  };

  /**
   * Validates asset creation form
   * Assets have different validation requirements than players
   */
  const validateForm = () => {
    const errors = [];

    if (!formData.assetName.trim()) {
      errors.push("Asset name is required");
    } else if (formData.assetName.length < 2) {
      errors.push("Asset name must be at least 2 characters long");
    }

    const levelRequire = parseInt(formData.levelRequire);
    if (!levelRequire || levelRequire < 1 || levelRequire > 100) {
      errors.push("Level requirement must be between 1 and 100");
    }

    if (!formData.description.trim()) {
      errors.push("Description is required");
    } else if (formData.description.length < 10) {
      errors.push("Description must be at least 10 characters long");
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      const assetData = {
        ...formData,
        levelRequire: parseInt(formData.levelRequire),
      };

      const result = await apiService.createAsset(assetData);

      if (result.success) {
        setMessage({
          type: "success",
          text: `🎉 ${result.message} Asset "${formData.assetName}" has been created successfully!`,
        });

        setFormData({
          assetName: "",
          levelRequire: "",
          description: "",
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

  /**
   * Helper function to suggest asset names based on category
   * This demonstrates dynamic UI updates based on user selections
   */
  const handleCategorySelect = (category) => {
    // This could expand to pre-fill form fields based on category
    console.log(`Selected category: ${category.name}`);
    // Future enhancement: pre-fill appropriate level requirements
  };

  return (
    <div className="asset-creation">
      <div className="form-header">
        <h2>⚔️ Create New Asset</h2>
        <p>Design new items, weapons, and equipment for your game world.</p>
      </div>

      {/* Asset category inspiration section */}
      <div className="category-inspiration">
        <h3>💡 Asset Categories</h3>
        <p>
          Choose a category for inspiration, or create something entirely
          unique!
        </p>
        <div className="category-grid">
          {assetCategories.map((category) => (
            <button
              key={category.name}
              type="button"
              className="category-card"
              onClick={() => handleCategorySelect(category)}
              disabled={isSubmitting}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
              <small className="category-examples">{category.examples}</small>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="asset-form">
        <div className="form-group">
          <label htmlFor="assetName">
            Asset Name *
            <span className="field-hint">
              Give your asset a memorable and descriptive name
            </span>
          </label>
          <input
            type="text"
            id="assetName"
            name="assetName"
            value={formData.assetName}
            onChange={handleInputChange}
            placeholder="e.g., Flaming Sword of Destiny"
            maxLength="100"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="levelRequire">
            Level Requirement *
            <span className="field-hint">
              Minimum player level needed to use this asset (1-100)
            </span>
          </label>
          <input
            type="number"
            id="levelRequire"
            name="levelRequire"
            value={formData.levelRequire}
            onChange={handleInputChange}
            placeholder="10"
            min="1"
            max="100"
            disabled={isSubmitting}
          />
          <div className="level-guide">
            <span className="level-range beginner">1-10: Beginner</span>
            <span className="level-range intermediate">
              11-25: Intermediate
            </span>
            <span className="level-range advanced">26-50: Advanced</span>
            <span className="level-range expert">51-100: Expert</span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">
            Description *
            <span className="field-hint">
              Describe the asset's appearance, abilities, and lore (minimum 10
              characters)
            </span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="A magnificent sword forged in the heart of a volcano, imbued with eternal flames that never fade. This legendary weapon grants its wielder increased fire damage and protection against ice attacks..."
            rows="4"
            maxLength="500"
            disabled={isSubmitting}
          />
          <div className="character-count">
            {formData.description.length}/500 characters
          </div>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}

        <button type="submit" className="submit-button" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="spinner"></span>
              Creating Asset...
            </>
          ) : (
            <>🎨 Create Asset</>
          )}
        </button>
      </form>

      <div className="creation-tips">
        <h3>🎯 Asset Creation Tips</h3>
        <div className="tips-grid">
          <div className="tip">
            <h4>⚖️ Balance</h4>
            <p>
              Consider how powerful the asset should be relative to its level
              requirement
            </p>
          </div>
          <div className="tip">
            <h4>📖 Lore</h4>
            <p>
              Rich descriptions make assets more engaging and immersive for
              players
            </p>
          </div>
          <div className="tip">
            <h4>🎯 Purpose</h4>
            <p>
              Think about how this asset fits into your game's progression
              system
            </p>
          </div>
          <div className="tip">
            <h4>✨ Uniqueness</h4>
            <p>
              What makes this asset special compared to others at the same
              level?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetCreation;
