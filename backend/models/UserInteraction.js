const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserInteraction = sequelize.define('UserInteraction', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    profile_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'profiles',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    article_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'articles',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    interaction_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Timestamp when user interacted with the article',
    },
    
    bookmark_timestamp: {
      type: DataTypes.DATE,
      allowNull: true,   
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,    
    },
  
  }, {
    tableName: 'user_interactions',
    timestamps: false, // No created_at/updated_at in schema
    underscored: true,
    indexes: [
      {
        name: 'idx_user_interactions_profile',
        fields: ['profile_id'],
      },
      {
        name: 'idx_user_interactions_article',
        fields: ['article_id'],
      },
    ],
  });

  // Define associations
  UserInteraction.associate = (models) => {
    UserInteraction.belongsTo(models.Profile, {
      foreignKey: 'profile_id',
      as: 'profile',
    });

    UserInteraction.belongsTo(models.Article, {
      foreignKey: 'article_id',
      as: 'article',
    });
  };

  return UserInteraction;
};