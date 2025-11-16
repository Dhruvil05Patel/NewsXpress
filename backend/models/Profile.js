const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Profile = sequelize.define('Profile', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      comment: 'Firebase UID converted to UUID format - serves as primary key',
      // No defaultValue - we explicitly set it from Firebase UID
    },
    auth_id: {
      type: DataTypes.UUID,
      allowNull: true,
      // unique: true, // Removed - causes ALTER TABLE syntax errors
      comment: 'Deprecated - Firebase UID now stored in id field',
    },
    full_name: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    username: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    email: {
     type: DataTypes.TEXT,
     allowNull: false,
     unique: true,
      comment: "User email stored in profiles table",
    },
    avatar_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Hashed password',
    },
    pass_updated_times: {
      type: DataTypes.ARRAY(DataTypes.DATE),
      allowNull: true,
      defaultValue: [],
      comment: 'Array of timestamps when password was changed',
    },

    actor: {
      type: DataTypes.ARRAY(DataTypes.TEXT), // Corresponds to text[]
      allowNull: true,
    },
    place: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    topic: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // New fields per database schema
    fcm_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    categories: {
      type: DataTypes.ARRAY(DataTypes.TEXT), // Corresponds to text[]
      allowNull: true,
      defaultValue: [],
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
    tableName: 'profiles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
      {
        name: 'idx_profiles_auth_id',
        fields: ['auth_id'],
      },
    ],
  });

  // Define associations
  Profile.associate = (models) => {
   
    Profile.hasMany(models.UserInteraction, {
      foreignKey: 'profile_id',
      as: 'interactions',
      onDelete: 'CASCADE',
    });

    Profile.hasMany(models.Notification, {
      foreignKey: 'profile_id',
      as: 'notifications',
      onDelete: 'CASCADE',
    });
  };

  return Profile;
};
