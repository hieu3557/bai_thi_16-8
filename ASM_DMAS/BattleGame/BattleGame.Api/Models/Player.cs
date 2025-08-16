using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BattleGame.Api.Models
{
    /// <summary>
    /// Represents a game player with their statistics and account information
    /// </summary>
    public class Player
    {
        /// <summary>
        /// Unique identifier for this player - MongoDB generates this automatically
        /// </summary>
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        /// <summary>
        /// Unique username chosen by the player for login and identification
        /// </summary>
        [BsonElement("playerName")]
        public string PlayerName { get; set; } = string.Empty;

        /// <summary>
        /// Player's real full name for account records
        /// </summary>
        [BsonElement("fullName")]
        public string FullName { get; set; } = string.Empty;

        /// <summary>
        /// Player's age - might affect game content or social features
        /// </summary>
        [BsonElement("age")]
        public int Age { get; set; }

        /// <summary>
        /// Current game level achieved by the player
        /// </summary>
        [BsonElement("level")]
        public int Level { get; set; }

        /// <summary>
        /// Contact email for account recovery and notifications
        /// </summary>
        [BsonElement("email")]
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// When this player account was created
        /// </summary>
        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}