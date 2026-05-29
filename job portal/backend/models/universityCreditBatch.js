// models/UniversityCreditBatch.js
module.exports = (sequelize, DataTypes) => {
  const UniversityCreditBatch = sequelize.define(
    "UniversityCreditBatch",
    {
      batch_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      university_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "university_details",
          key: "id", 
        },
        onDelete: "CASCADE",
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "university_credit_orders",
          key: "order_id",
        },
        onDelete: "CASCADE",
      },
      credits_added: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      credits_used: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "university_credit_batches",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
      indexes: [
        { fields: ["university_id"] },
        { fields: ["university_id", "expires_at"] },
        { fields: ["order_id"] },
      ],
    }
  );

  UniversityCreditBatch.associate = function (models) {
    UniversityCreditBatch.belongsTo(models.UniversityDetail, {
      foreignKey: "university_id",
      targetKey: "id", 
      as: "university",
    });

    UniversityCreditBatch.belongsTo(models.UniversityCreditOrder, {
      foreignKey: "order_id",
      as: "order",
    });
  };

  return UniversityCreditBatch;
};
