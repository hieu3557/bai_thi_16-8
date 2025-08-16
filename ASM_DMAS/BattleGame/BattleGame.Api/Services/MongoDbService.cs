using MongoDB.Driver;
using MongoDB.Bson;
using BattleGame.Api.Models;

namespace BattleGame.Api.Services
{
    /// <summary>
    /// Service class that handles all database operations for the BattleGame application
    /// This encapsulates MongoDB-specific code and provides a clean interface for controllers
    /// </summary>
    public class MongoDbService
    {
        private readonly IMongoDatabase _database;
        private readonly IMongoCollection<Player> _players;
        private readonly IMongoCollection<Asset> _assets;
        private readonly IMongoCollection<PlayerAsset> _playerAssets;

        /// <summary>
        /// Constructor that establishes database connection and initializes collections
        /// Collections in MongoDB are like tables in SQL databases
        /// </summary>
        /// <param name="connectionString">MongoDB connection string (e.g., mongodb://localhost:27017)</param>
        /// <param name="databaseName">Name of the database to use</param>
        public MongoDbService(string connectionString, string databaseName)
        {
            // Create a MongoClient instance - this manages the connection to MongoDB
            var client = new MongoClient(connectionString);

            // Get reference to the specific database - MongoDB creates it if it doesn't exist
            _database = client.GetDatabase(databaseName);

            // Initialize collection references - these are like table references in SQL
            // MongoDB creates collections automatically when you first insert documents
            _players = _database.GetCollection<Player>("players");
            _assets = _database.GetCollection<Asset>("assets");
            _playerAssets = _database.GetCollection<PlayerAsset>("playerAssets");
        }

        #region Player Operations

        /// <summary>
        /// Creates a new player in the database
        /// This method demonstrates basic document insertion
        /// </summary>
        /// <param name="player">Player object to create</param>
        /// <returns>The created player with database-generated ID</returns>
        public async Task<Player> CreatePlayerAsync(Player player)
        {
            // InsertOneAsync adds the document and automatically populates the Id property
            // The 'await' keyword ensures this method waits for the database operation to complete
            await _players.InsertOneAsync(player);
            return player;
        }

        /// <summary>
        /// Retrieves a player by their database ID
        /// This demonstrates querying by the primary key
        /// </summary>
        /// <param name="playerId">ObjectId of the player to find</param>
        /// <returns>Player if found, null if not found</returns>
        public async Task<Player?> GetPlayerByIdAsync(string playerId)
        {
            // Find().FirstOrDefaultAsync() returns the first matching document or null
            // This pattern is common for single-document queries
            return await _players.Find(p => p.Id == playerId).FirstOrDefaultAsync();
        }

        /// <summary>
        /// Retrieves a player by their unique username
        /// This demonstrates querying by a non-primary key field
        /// </summary>
        /// <param name="playerName">Username to search for</param>
        /// <returns>Player if found, null if not found</returns>
        public async Task<Player?> GetPlayerByNameAsync(string playerName)
        {
            // Query by playerName field - useful for login systems and duplicate checking
            return await _players.Find(p => p.PlayerName == playerName).FirstOrDefaultAsync();
        }

        /// <summary>
        /// Retrieves all players from the database
        /// This method queries the players collection directly
        /// </summary>
        /// <returns>List of all players</returns>
        public async Task<List<Player>> GetAllPlayersAsync()
        {
            try
            {
                return await _players.Find(_ => true)
                                   .SortBy(p => p.PlayerName)
                                   .ToListAsync();
            }
            catch (Exception ex)
            {
                // Log the exception and rethrow
                throw new Exception($"Failed to retrieve players: {ex.Message}", ex);
            }
        }

        #endregion

        #region Asset Operations

        /// <summary>
        /// Creates a new asset in the database
        /// Similar pattern to player creation but for assets
        /// </summary>
        /// <param name="asset">Asset object to create</param>
        /// <returns>The created asset with database-generated ID</returns>
        public async Task<Asset> CreateAssetAsync(Asset asset)
        {
            await _assets.InsertOneAsync(asset);
            return asset;
        }

        /// <summary>
        /// Retrieves an asset by its database ID
        /// </summary>
        /// <param name="assetId">ObjectId of the asset to find</param>
        /// <returns>Asset if found, null if not found</returns>
        public async Task<Asset?> GetAssetByIdAsync(string assetId)
        {
            return await _assets.Find(a => a.Id == assetId).FirstOrDefaultAsync();
        }

        /// <summary>
        /// Retrieves all assets, ordered by creation date
        /// This demonstrates querying for multiple documents with sorting
        /// </summary>
        /// <returns>List of all assets</returns>
        public async Task<List<Asset>> GetAllAssetsAsync()
        {
            // SortBy() orders the results - useful for consistent display order
            return await _assets.Find(_ => true)
                                .SortBy(a => a.CreatedAt)
                                .ToListAsync();
        }

        #endregion

        #region PlayerAsset Operations

        /// <summary>
        /// Assigns an asset to a player by creating a PlayerAsset relationship
        /// This demonstrates creating relationship documents
        /// </summary>
        /// <param name="playerId">ID of the player receiving the asset</param>
        /// <param name="assetId">ID of the asset being assigned</param>
        /// <returns>The created PlayerAsset relationship</returns>
        public async Task<PlayerAsset> AssignAssetToPlayerAsync(string playerId, string assetId)
        {
            var playerAsset = new PlayerAsset
            {
                PlayerId = playerId,
                AssetId = assetId,
                AssignedAt = DateTime.UtcNow
            };

            await _playerAssets.InsertOneAsync(playerAsset);
            return playerAsset;
        }

        /// <summary>
        /// Generates a comprehensive report of all player assets
        /// This demonstrates MongoDB aggregation pipeline - a powerful feature for complex queries
        /// </summary>
        /// <returns>List of player asset reports with combined player and asset information</returns>
        public async Task<List<PlayerAssetReport>> GetPlayerAssetsReportAsync()
        {
            // MongoDB aggregation pipeline allows you to perform complex data transformations
            // Think of this like JOIN operations in SQL, but more flexible
            var pipeline = new BsonDocument[]
            {
                // $lookup stage: Join with players collection
                // This is equivalent to a LEFT JOIN in SQL
                new BsonDocument("$lookup", new BsonDocument
                {
                    { "from", "players" },                    // Collection to join with
                    { "localField", "playerId" },             // Field in playerAssets collection
                    { "foreignField", "_id" },                // Field in players collection
                    { "as", "player" }                        // Name for the result array
                }),

                // $lookup stage: Join with assets collection
                new BsonDocument("$lookup", new BsonDocument
                {
                    { "from", "assets" },
                    { "localField", "assetId" },
                    { "foreignField", "_id" },
                    { "as", "asset" }
                }),

                // $unwind stages: Convert arrays to individual documents
                // Since we expect one player and one asset per playerAsset, unwind flattens the arrays
                new BsonDocument("$unwind", "$player"),
                new BsonDocument("$unwind", "$asset"),

                // $project stage: Shape the output document
                // This selects and renames fields for the final result
                new BsonDocument("$project", new BsonDocument
                {
                    { "playerName", "$player.playerName" },
                    { "level", "$player.level" },
                    { "age", "$player.age" },
                    { "assetName", "$asset.assetName" }
                })
            };

            // Execute the aggregation pipeline and get results as BsonDocuments
            var result = await _playerAssets.Aggregate<BsonDocument>(pipeline).ToListAsync();

            // Transform BsonDocuments into strongly-typed PlayerAssetReport objects
            var reports = new List<PlayerAssetReport>();
            for (int i = 0; i < result.Count; i++)
            {
                var doc = result[i];
                reports.Add(new PlayerAssetReport
                {
                    No = i + 1,  // Sequential numbering for display
                    PlayerName = doc["playerName"].AsString,
                    Level = doc["level"].AsInt32,
                    Age = doc["age"].AsInt32,
                    AssetName = doc["assetName"].AsString
                });
            }

            return reports;
        }

        #endregion
    }
}