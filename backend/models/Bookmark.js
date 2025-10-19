const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Bookmark = sequelize.define('Bookmark', {
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
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Optional note/comment about the bookmarked article',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'bookmarks',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    underscored: true,
    indexes: [
      {
        name: 'idx_bookmarks_profile',
        fields: ['profile_id'],
      },
      {
        name: 'idx_bookmarks_article',
        fields: ['article_id'],
      },
    ],
  });

  // Define associations
  Bookmark.associate = (models) => {
    Bookmark.belongsTo(models.Profile, {
      foreignKey: 'profile_id',
      as: 'profile',
    });

    Bookmark.belongsTo(models.Article, {
      foreignKey: 'article_id',
      as: 'article',
    });
  };

  return Bookmark;
};
