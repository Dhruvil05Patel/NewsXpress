// Import Sequelize (ORM for PostgreSQL and other SQL databases)
const { Sequelize } = require("sequelize");

// Load environment variables from .env file
require("dotenv").config();

// =================== DEBUGGING ENV VARIABLES =================== //
// This section just prints out important environment variables to check if they are set correctly
console.log("🔍 Environment Variables Debug:");
console.log(
  "DATABASE_URL:",
  process.env.DATABASE_URL ? "✅ Set" : "❌ Not set"
);
console.log("NODE_ENV:", process.env.NODE_ENV || "Not set");
console.log("PORT:", process.env.PORT || "Not set");

// If DATABASE_URL exists, parse it and print host, port, and database name
if (process.env.DATABASE_URL) {
  try {
    const url = new URL(process.env.DATABASE_URL);
    console.log("Database Host:", url.hostname);
    console.log("Database Port:", url.port);
    console.log("Database Name:", url.pathname.substring(1));
  } catch (error) {
    console.log("❌ Invalid DATABASE_URL format");
  }
}

// =================== SEQUELIZE CONFIGURATION =================== //
// Create a Sequelize instance connected to your Supabase PostgreSQL database
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres", // Database type is PostgreSQL
  logging: process.env.NODE_ENV === "development" ? console.log : false, // Log SQL queries only in development
  pool: {
    max: 5,      // Maximum number of connections
    min: 0,      // Minimum number of connections
    acquire: 30000, // Max time (ms) Sequelize tries to connect before throwing error
    idle: 10000, // Time (ms) a connection can be idle before being released
  },
  define: {
    timestamps: true,    // Automatically add createdAt and updatedAt columns
    underscored: true,   // Use snake_case instead of camelCase for column names
    freezeTableName: true, // Prevent Sequelize from pluralizing table names
  },
  dialectOptions: {
    // SSL config required by Supabase in production
    ssl:
      process.env.NODE_ENV === "production"
        ? {
            require: true,
            rejectUnauthorized: false, // Allow self-signed certificates
          }
        : false, // No SSL in development
  },
});

// =================== CONNECT FUNCTION =================== //
// Function to test database connection
const connectDB = async () => {
  try {
    console.log("🔄 Attempting to connect to database...");
    await sequelize.authenticate(); // Authenticate DB connection
    console.log("✅ Supabase PostgreSQL database connected successfully.");
  } catch (error) {
    console.error("❌ Error connecting to database:", error.message);
    console.error("Full error:", error);
    process.exit(1); // Stop the app if DB connection fails
  }
};

// Export sequelize instance and connect function
module.exports = { sequelize, connectDB };
