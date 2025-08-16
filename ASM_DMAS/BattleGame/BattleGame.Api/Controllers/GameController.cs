using Microsoft.AspNetCore.Mvc;
using BattleGame.Api.Models;
using BattleGame.Api.Services;

namespace BattleGame.Api.Controllers
{
    /// <summary>
    /// Controller that handles all game-related HTTP requests
    /// The [Route] attribute defines the base URL path for all actions in this controller
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class GameController : ControllerBase
    {
        private readonly MongoDbService _mongoDbService;
        private readonly ILogger<GameController> _logger;

        /// <summary>
        /// Constructor that receives dependencies through dependency injection
        /// This pattern makes the controller easier to test and more flexible
        /// </summary>
        /// <param name="mongoDbService">Service for database operations</param>
        /// <param name="logger">Service for logging application events</param>
        public GameController(MongoDbService mongoDbService, ILogger<GameController> logger)
        {
            _mongoDbService = mongoDbService;
            _logger = logger;
        }

        /// <summary>
        /// Registers a new player in the game system
        /// HTTP POST /api/game/registerplayer
        /// This demonstrates input validation, business rule checking, and error handling
        /// </summary>
        /// <param name="player">Player data from the request body</param>
        /// <returns>HTTP response with the created player or error information</returns>
        [HttpPost("registerplayer")]
        public async Task<IActionResult> RegisterPlayer([FromBody] Player player)
        {
            // Log the incoming request for debugging and monitoring
            _logger.LogInformation("RegisterPlayer endpoint called with player name: {PlayerName}", player?.PlayerName);

            try
            {
                // First level of validation: Check if the model binding succeeded
                // ModelState contains validation results from data annotations and model binding
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state for player registration: {Errors}",
                        string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)));
                    return BadRequest(ModelState);
                }

                // Second level of validation: Check business rules
                // These are validations that go beyond simple data type checking
                if (string.IsNullOrWhiteSpace(player.PlayerName) || string.IsNullOrWhiteSpace(player.FullName))
                {
                    _logger.LogWarning("Registration attempted with missing required fields");
                    return BadRequest(new
                    {
                        error = "Validation failed",
                        message = "PlayerName and FullName are required and cannot be empty"
                    });
                }

                // Business rule: Check for duplicate player names
                // This prevents multiple players from having the same username
                var existingPlayer = await _mongoDbService.GetPlayerByNameAsync(player.PlayerName);
                if (existingPlayer != null)
                {
                    _logger.LogWarning("Registration attempted with existing player name: {PlayerName}", player.PlayerName);
                    return Conflict(new
                    {
                        error = "Player already exists",
                        message = $"A player with the name '{player.PlayerName}' already exists"
                    });
                }

                // All validations passed - create the player
                var createdPlayer = await _mongoDbService.CreatePlayerAsync(player);

                _logger.LogInformation("Player created successfully with ID: {PlayerId}", createdPlayer.Id);

                // Return 201 Created with the new player data
                // CreatedAtAction includes a Location header with the URL to retrieve this resource
                return CreatedAtAction(
                    nameof(RegisterPlayer),
                    new { id = createdPlayer.Id },
                    new
                    {
                        success = true,
                        message = "Player registered successfully",
                        playerId = createdPlayer.Id,
                        player = createdPlayer
                    });
            }
            catch (Exception ex)
            {
                // Log the full exception for debugging, but don't expose internal details to clients
                _logger.LogError(ex, "Unexpected error during player registration");

                // Return a generic error message to avoid leaking implementation details
                return StatusCode(500, new
                {
                    error = "Internal server error",
                    message = "An unexpected error occurred while registering the player"
                });
            }
        }

        /// <summary>
        /// Creates a new asset in the game system
        /// HTTP POST /api/game/createasset
        /// This follows similar patterns to player registration but for assets
        /// </summary>
        /// <param name="asset">Asset data from the request body</param>
        /// <returns>HTTP response with the created asset or error information</returns>
        [HttpPost("createasset")]
        public async Task<IActionResult> CreateAsset([FromBody] Asset asset)
        {
            _logger.LogInformation("CreateAsset endpoint called with asset name: {AssetName}", asset?.AssetName);

            try
            {
                // Model validation - same pattern as player registration
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state for asset creation: {Errors}",
                        string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)));
                    return BadRequest(ModelState);
                }

                // Business validation for assets
                if (string.IsNullOrWhiteSpace(asset.AssetName))
                {
                    _logger.LogWarning("Asset creation attempted with missing asset name");
                    return BadRequest(new
                    {
                        error = "Validation failed",
                        message = "AssetName is required and cannot be empty"
                    });
                }

                // Additional business rule: Level requirement should be reasonable
                if (asset.LevelRequire < 0 || asset.LevelRequire > 100)
                {
                    _logger.LogWarning("Asset creation attempted with invalid level requirement: {Level}", asset.LevelRequire);
                    return BadRequest(new
                    {
                        error = "Validation failed",
                        message = "Level requirement must be between 0 and 100"
                    });
                }

                // Create the asset
                var createdAsset = await _mongoDbService.CreateAssetAsync(asset);

                _logger.LogInformation("Asset created successfully with ID: {AssetId}", createdAsset.Id);

                return CreatedAtAction(
                    nameof(CreateAsset),
                    new { id = createdAsset.Id },
                    new
                    {
                        success = true,
                        message = "Asset created successfully",
                        assetId = createdAsset.Id,
                        asset = createdAsset
                    });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during asset creation");
                return StatusCode(500, new
                {
                    error = "Internal server error",
                    message = "An unexpected error occurred while creating the asset"
                });
            }
        }

        /// <summary>
        /// Retrieves a report of all player assets
        /// HTTP GET /api/game/getassetsbyplayer
        /// This demonstrates data retrieval and response formatting
        /// </summary>
        /// <returns>HTTP response with player assets report</returns>
        [HttpGet("getassetsbyplayer")]
        public async Task<IActionResult> GetAssetsByPlayer()
        {
            _logger.LogInformation("GetAssetsByPlayer endpoint called");

            try
            {
                // Retrieve the aggregated report from the service
                var playerAssetsReport = await _mongoDbService.GetPlayerAssetsReportAsync();

                _logger.LogInformation("Retrieved {Count} player asset records", playerAssetsReport.Count);

                // Return 200 OK with the data
                // This endpoint always succeeds if no exception occurs, even if the list is empty
                return Ok(new
                {
                    success = true,
                    message = $"Retrieved {playerAssetsReport.Count} player asset records",
                    data = playerAssetsReport,
                    count = playerAssetsReport.Count,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while retrieving player assets");
                return StatusCode(500, new
                {
                    error = "Internal server error",
                    message = "An unexpected error occurred while retrieving player assets"
                });
            }
        }

        /// <summary>
        /// Assigns an asset to a player
        /// HTTP POST /api/game/assignasset
        /// This is a bonus endpoint that demonstrates relationship creation
        /// </summary>
        /// <param name="request">Request containing player ID and asset ID</param>
        /// <returns>HTTP response confirming the assignment</returns>
        [HttpPost("assignasset")]
        public async Task<IActionResult> AssignAsset([FromBody] AssignAssetRequest request)
        {
            _logger.LogInformation("AssignAsset endpoint called for player {PlayerId} and asset {AssetId}",
                request.PlayerId, request.AssetId);

            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Validate that both player and asset exist before creating the relationship
                var player = await _mongoDbService.GetPlayerByIdAsync(request.PlayerId);
                if (player == null)
                {
                    return NotFound(new
                    {
                        error = "Player not found",
                        message = $"No player found with ID {request.PlayerId}"
                    });
                }

                var asset = await _mongoDbService.GetAssetByIdAsync(request.AssetId);
                if (asset == null)
                {
                    return NotFound(new
                    {
                        error = "Asset not found",
                        message = $"No asset found with ID {request.AssetId}"
                    });
                }

                // Business rule: Check if player level meets asset requirement
                if (player.Level < asset.LevelRequire)
                {
                    return BadRequest(new
                    {
                        error = "Level requirement not met",
                        message = $"Player level {player.Level} is below required level {asset.LevelRequire} for asset '{asset.AssetName}'"
                    });
                }

                // Create the assignment
                var playerAsset = await _mongoDbService.AssignAssetToPlayerAsync(request.PlayerId, request.AssetId);

                _logger.LogInformation("Asset {AssetName} assigned to player {PlayerName}", asset.AssetName, player.PlayerName);

                return Ok(new
                {
                    success = true,
                    message = $"Asset '{asset.AssetName}' assigned to player '{player.PlayerName}'",
                    assignment = playerAsset
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during asset assignment");
                return StatusCode(500, new
                {
                    error = "Internal server error",
                    message = "An unexpected error occurred while assigning the asset"
                });
            }
        }

        /// <summary>
        /// Retrieves all players in the system
        /// This endpoint is needed for frontend dropdowns and selection interfaces
        /// </summary>
        [HttpGet("players")]
        public async Task<IActionResult> GetAllPlayers()
        {
            _logger.LogInformation("GetAllPlayers endpoint called");

            try
            {
                var allPlayers = await _mongoDbService.GetAllPlayersAsync();

                _logger.LogInformation("Retrieved {Count} players", allPlayers.Count);

                return Ok(new
                {
                    success = true,
                    data = allPlayers.Select(p => new
                    {
                        playerId = p.Id,
                        playerName = p.PlayerName,
                        fullName = p.FullName,
                        level = p.Level,
                        age = p.Age,
                        email = p.Email
                    }),
                    count = allPlayers.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving players");
                return StatusCode(500, new
                {
                    error = "Internal server error",
                    message = "An unexpected error occurred while retrieving players"
                });
            }
        }

        /// <summary>
        /// Retrieves all assets in the system
        /// This endpoint is needed for frontend dropdowns and selection interfaces  
        /// </summary>
        [HttpGet("assets")]
        public async Task<IActionResult> GetAllAssets()
        {
            _logger.LogInformation("GetAllAssets endpoint called");

            try
            {
                // Get all assets from the database
                var allAssets = await _mongoDbService.GetAllAssetsAsync();

                _logger.LogInformation("Retrieved {Count} assets", allAssets.Count);

                return Ok(new
                {
                    success = true,
                    data = allAssets.Select(a => new
                    {
                        assetId = a.Id,
                        assetName = a.AssetName,
                        levelRequire = a.LevelRequire,
                        description = a.Description
                    }),
                    count = allAssets.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving assets");
                return StatusCode(500, new
                {
                    error = "Internal server error",
                    message = "An unexpected error occurred while retrieving assets"
                });
            }
        }
    }

    /// <summary>
    /// Request model for the assign asset endpoint
    /// Using specific request models makes the API more explicit and easier to document
    /// </summary>
    public class AssignAssetRequest
    {
        public string PlayerId { get; set; } = string.Empty;
        public string AssetId { get; set; } = string.Empty;
    }
}