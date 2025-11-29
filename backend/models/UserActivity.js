const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserActivity = sequelize.define('UserActivity', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
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
    activity_type: {
      type: DataTypes.STRING, // Match existing ENUM as STRING
      allowNull: false,
      defaultValue: 'view',
    },
    duration_seconds: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    scroll_percentage: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    source: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    recommendation_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'user_activities',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  // Define associations
  UserActivity.associate = (models) => {
    UserActivity.belongsTo(models.Profile, {
      foreignKey: 'user_id',
      as: 'user',
    });

    UserActivity.belongsTo(models.Article, {
      foreignKey: 'article_id',
      as: 'article',
    });
  };

  return UserActivity;
};
