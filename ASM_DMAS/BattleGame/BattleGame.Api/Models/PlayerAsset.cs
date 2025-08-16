using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BattleGame.Api.Models
{
    /// <summary>
    /// Represents the relationship between a player and an asset they own
    /// This is like a "join table" in relational databases, but stored as documents
    /// </summary>
    public class PlayerAsset
    {
        /// <summary>
        /// Unique identifier for this ownership relationship
        /// </summary>
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        /// <summary>
        /// Reference to the player who owns this asset
        /// This stores the ObjectId of a Player document
        /// </summary>
        [BsonElement("playerId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string PlayerId { get; set; } = string.Empty;

        /// <summary>
        /// Reference to the asset that is owned
        /// This stores the ObjectId of an Asset document
        /// </summary>
        [BsonElement("assetId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string AssetId { get; set; } = string.Empty;

        /// <summary>
        /// When this asset was assigned to the player
        /// Useful for tracking acquisition history
        /// </summary>
        [BsonElement("assignedAt")]
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Data Transfer Object for the player assets report
    /// This represents the flattened view combining player and asset information
    /// DTOs help separate internal data structure from API response format
    /// </summary>
    public class PlayerAssetReport
    {
        /// <summary>
        /// Sequential number for display in tables (1, 2, 3...)
        /// </summary>
        public int No { get; set; }

        /// <summary>
        /// Player's display name from the Player document
        /// </summary>
        public string PlayerName { get; set; } = string.Empty;

        /// <summary>
        /// Player's current level from the Player document
        /// </summary>
        public int Level { get; set; }

        /// <summary>
        /// Player's age from the Player document
        /// </summary>
        public int Age { get; set; }

        /// <summary>
        /// Asset's display name from the Asset document
        /// </summary>
        public string AssetName { get; set; } = string.Empty;
    }
}