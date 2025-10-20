const { sequelize, connectDB } = require('./config/db');

// Import all model definitions
const ArticleModel = require('./models/Article');
const SourceModel = require('./models/Source');
const BookmarkModel = require('./models/Bookmark');
const UserInteractionModel = require('./models/UserInteraction');
const ProfileModel = require('./models/Profile');
const NotificationModel = require('./models/Notification');

async function syncDatabase() {
  try {
    console.log('Connecting to database...');
    await connectDB();

    console.log('Initializing models...');
    
    // Initialize all models
    const Article = ArticleModel(sequelize);
    const Source = SourceModel(sequelize);
    const Bookmark = BookmarkModel(sequelize);
    const UserInteraction = UserInteractionModel(sequelize);
    const Profile = ProfileModel(sequelize);
    const Notification = NotificationModel(sequelize);

    // Create models object for associations
    const models = { Article, Source, Bookmark, UserInteraction, Profile, Notification };

    // Set up all associations
    if (Article.associate) Article.associate(models);
    if (Source.associate) Source.associate(models);
    if (Bookmark.associate) Bookmark.associate(models);
    if (UserInteraction.associate) UserInteraction.associate(models);
    if (Profile.associate) Profile.associate(models);
    if (Notification.associate) Notification.associate(models);

    console.log('Syncing models with database...');
    
    // This will create tables if they don't exist
    // Use { alter: true } to add missing columns without dropping tables
    // Use { force: true } to drop and recreate all tables (DANGER!)
    await sequelize.sync({ alter: true });
    
    console.log('Database sync completed successfully!');
    console.log('\n Synced models:');
    console.log('  - profiles');
    console.log('  - sources');
    console.log('  - articles');
    console.log('  - bookmarks');
    console.log('  - user_interactions');
    console.log('  - notifications');
    
    process.exit(0);
  } catch (error) {
    console.error('Error syncing database:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

syncDatabase();
