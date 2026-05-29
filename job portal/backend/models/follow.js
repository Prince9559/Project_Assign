module.exports = (sequelize, DataTypes) => {
  const Follow = sequelize.define(
    "Follow",
    {
      follower_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      followed_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
    },
    {
      tableName: "follows",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          unique: true,
          fields: ["follower_id", "followed_id"],
        },
      ],
    }
  );

  Follow.associate = function (models) {
    Follow.belongsTo(models.User, { foreignKey: 'follower_id', as: 'Follower' });
    Follow.belongsTo(models.User, { foreignKey: 'followed_id', as: 'Followed' });
  };

  return Follow;
};
