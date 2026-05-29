const crypto = require("crypto");
function nanoid(len = 8) {
  return crypto
    .randomBytes(len)
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, len)
    .toLowerCase();
}

module.exports = (sequelize, DataTypes) => {
  const FeedPost = sequelize.define(
    "FeedPost",
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      caption: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      user_role: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      profile_pic: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      like_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      comment_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        defaultValue: () => nanoid(8), //autogenrate slug for sharing
      },
    },
    {
      tableName: "feed_posts",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  FeedPost.associate = function (models) {
    FeedPost.belongsTo(models.User, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
    });

    FeedPost.hasMany(models.PostComments, {
      foreignKey: "post_id",
      as: "comments",
    });
  };

  

  return FeedPost;
};
