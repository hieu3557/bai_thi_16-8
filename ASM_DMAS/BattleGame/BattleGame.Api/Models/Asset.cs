using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BattleGame.Api.Models
{
    /// <summary>
    /// Represents a game asset such as a hero, weapon, or equipment piece
    /// </summary>
    public class Asset
    {
        /// <summary>
        /// Unique identifier for this asset - MongoDB generates this automatically
        /// </summary>
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        /// <summary>
        /// Display name of the asset (e.g., "Fire Sword", "Ice Hero")
        /// </summary>
        [BsonElement("assetName")]
        public string AssetName { get; set; } = string.Empty;

        /// <summary>
        /// Minimum player level required to use this asset
        /// </summary>
        [BsonElement("levelRequire")]
        public int LevelRequire { get; set; }

        /// <summary>
        /// Detailed description of the asset's capabilities or appearance
        /// </summary>
        [BsonElement("description")]
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// When this asset was created in the database
        /// </summary>
        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}