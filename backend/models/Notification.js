const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notification = sequelize.define('Notification', {
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
    title: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'sent',
      comment: 'Status of the notification: sent, delivered, read, etc.',
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    delivered_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'notifications',
    timestamps: false,
    underscored: true,
    indexes: [
      {
        name: 'idx_notifications_profile',
        fields: ['profile_id'],
      },
    ],
  });

  // Define associations
  Notification.associate = (models) => {
    Notification.belongsTo(models.Profile, {
      foreignKey: 'profile_id',
      as: 'profile',
    });
  };

  return Notification;
};
