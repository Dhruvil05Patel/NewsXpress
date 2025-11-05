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
  
// =================== MODEL LOADING & ASSOCIATIONS =================== //

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import and initialize all your models
// (Adjust paths if your models are not in ../models/)
db.Profile = require('../models/Profile')(sequelize);
db.Source = require('../models/Source')(sequelize);
db.Article = require('../models/Article')(sequelize);
db.UserInteraction = require('../models/UserInteraction')(sequelize);
db.Notification = require('../models/Notification')(sequelize);

// Set up all associations
// This is crucial for models to know about each other
if (db.Profile.associate) {
  db.Profile.associate(db);
}
if (db.Article.associate) {
  db.Article.associate(db);
}
if (db.Source.associate) {
  db.Source.associate(db);
}
if (db.UserInteraction.associate) {
  db.UserInteraction.associate(db);
}
if (db.Notification.associate) {
  db.Notification.associate(db);
}

// =================== CONNECT FUNCTION  =================== //
// sync models after connecting
const connectDB = async () => {
  try {
    console.log("🔄 Attempting to connect to database...");
    await sequelize.authenticate(); // Authenticate DB connection
    console.log("✅ Supabase PostgreSQL database connected successfully.");

    // Sync all defined models
    await sequelize.sync({ force: false }); // { force: false } won't delete data
    console.log("✅ All models were synchronized successfully.");

  } catch (error) {
    console.error("❌ Error connecting to database:", error.message);
    console.error("Full error:", error);
    process.exit(1); // Stop the app if DB connection fails
  }
};

// Export sequelize instance, connect function, AND all your models
module.exports = {
  ...db,         // This exports Profile, Article, etc.
  sequelize,     // Export the instance
  connectDB      // Export the connect function
};