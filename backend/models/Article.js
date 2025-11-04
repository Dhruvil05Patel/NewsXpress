const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Article = sequelize.define('Article', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    original_url: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    source_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'sources',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    published_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    content_text: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    language_code: {
      type: DataTypes.STRING(5),
      allowNull: true,
      comment: 'Language code like en-IN, hi-IN',
    },
    image_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    actors: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
      defaultValue: [],
      comment: 'Array of actors/entities mentioned in the article',
    },
    place: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Location/place mentioned in the article',
    },
    topic: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Main topic/category of the article',
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
    tableName: 'articles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
      {
        name: 'uq_articles_original_url',
        unique: true,
        fields: ['original_url'],
      },
      {
        name: 'idx_articles_published_at',
        fields: ['published_at'],
      },
      {
        name: 'idx_articles_source_id',
        fields: ['source_id'],
      },
    ],
  });

  // Define associations
  Article.associate = (models) => {
    Article.belongsTo(models.Source, {
      foreignKey: 'source_id',
      as: 'source',
    });

    Article.hasMany(models.UserInteraction, {
      foreignKey: 'article_id',
      as: 'interactions',
      onDelete: 'CASCADE',
    });
  };

  return Article;
};
