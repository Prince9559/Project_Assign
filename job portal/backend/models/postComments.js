module.exports = (sequelize, DataTypes) => {
  const PostComments = sequelize.define(
    "PostComments",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      post_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "feed_posts", // ← Must match your FeedPost table name
          key: "id",
        },
        onDelete: "CASCADE", // Optional: auto-delete comments when post is deleted
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      parent_comment_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "post_comments",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      tableName: "post_comments",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  PostComments.associate = (models) => {
    PostComments.belongsTo(models.FeedPost, { foreignKey: "post_id", as: "Post" });
    PostComments.belongsTo(models.User, { foreignKey: "user_id", as: "Commenter" });


    // Self-referencing: a comment can have a parent comment
    PostComments.belongsTo(models.PostComments, {
      as: "ParentComment",
      foreignKey: "parent_comment_id",
    });

    PostComments.hasMany(models.PostComments, {
      as: "Replies",
      foreignKey: "parent_comment_id",
    });
  };

  return PostComments;
};
