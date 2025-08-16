using BattleGame.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the dependency injection container

// Add controller services - this enables MVC/Web API functionality
builder.Services.AddControllers();

// Add API documentation services - these generate Swagger/OpenAPI documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new()
    {
        Title = "BattleGame API",
        Version = "v1",
        Description = "API for managing game players, assets, and their relationships"
    });
});

// Configure CORS (Cross-Origin Resource Sharing) to allow frontend access
// CORS is a security feature that controls which domains can access your API
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        // For development, allow any origin, method, and header
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Register MongoDB service as a singleton
// This is appropriate for database services because connection pooling is handled internally
builder.Services.AddSingleton<MongoDbService>(provider =>
{
    // Get configuration service to read settings
    var configuration = provider.GetRequiredService<IConfiguration>();

    // Read connection settings from configuration
    // The ?? operator provides defaults if the settings are not found
    var connectionString = configuration.GetConnectionString("MongoDB") ?? "mongodb://localhost:27017";
    var databaseName = configuration["MongoDbDatabaseName"] ?? "BATTLEGAME";

    // Create and return the service instance
    return new MongoDbService(connectionString, databaseName);
});

// Build the application with all configured services
var app = builder.Build();

// Configure the HTTP request pipeline
// This defines how incoming requests are processed

// Enable Swagger UI in development environment
// Swagger provides a web interface for testing your API endpoints
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "BattleGame API v1");
        c.RoutePrefix = string.Empty; // Makes Swagger available at the root URL
    });
}

// Enable CORS - this must come before routing
app.UseCors();

// Enable routing to match URLs to controller actions
app.UseRouting();

// Map controller endpoints - this tells ASP.NET Core to look for controller classes
app.MapControllers();

// Add a simple health check endpoint
app.MapGet("/health", () => new
{
    status = "healthy",
    timestamp = DateTime.UtcNow,
    environment = app.Environment.EnvironmentName
});

// Start the application
app.Run();