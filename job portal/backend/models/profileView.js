// models/profileView.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ProfileView = sequelize.define(
    "ProfileView",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      viewer_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      viewed_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      // Optional: where did view come from? (search, feed, direct, notification, etc.)
      source: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: "direct",
        comment: "e.g., 'search', 'feed', 'direct', 'notification'",
      },
      // Timestamp of view
      viewed_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "profile_views",
      timestamps: false, // we only need viewed_at
      indexes: [
        {
          name: "idx_viewer_viewed",
          unique: false,
          fields: ["viewer_user_id", "viewed_user_id"],
        },
        {
          name: "idx_viewed_at",
          fields: ["viewed_at"],
        },
        {
          name: "idx_viewed_user",
          fields: ["viewed_user_id", "viewed_at"],
        },
      ],
    }
  );

  ProfileView.associate = (models) => {
    ProfileView.belongsTo(models.User, {
      foreignKey: "viewer_user_id",
      as: "viewer",
    });
    ProfileView.belongsTo(models.User, {
      foreignKey: "viewed_user_id",
      as: "viewedUser",
    });
  };

  return ProfileView;
};