// models/UniversityCreditOrder.js
module.exports = (sequelize, DataTypes) => {
  const UniversityCreditOrder = sequelize.define(
    "UniversityCreditOrder",
    {
      order_id: {
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
      package_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "university_credit_packages",
          key: "package_id",
        },
        onDelete: "RESTRICT",
      },
      credits_purchased: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      //will remove this amount field as si have alrady added breakup wise fields
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      // amount split
      base_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      tax_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      validity_days: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      razorpay_order_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
      },
      status: {
        type: DataTypes.ENUM(
          "created",
          "authorized",
          "paid",
          "failed",
          "expired",
          "refunded"
        ),
        allowNull: false,
        defaultValue: "created",
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      paid_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "university_credit_orders",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { fields: ["university_id"] },
        { fields: ["razorpay_order_id"] },
        { fields: ["status"] },
      ],
    }
  );

  UniversityCreditOrder.associate = function (models) {
    UniversityCreditOrder.belongsTo(models.UniversityDetail, {
      foreignKey: "university_id",
      targetKey: "id", 
      as: "university",
    });

    UniversityCreditOrder.belongsTo(models.UniversityCreditPackage, {
      foreignKey: "package_id",
      as: "package",
    });
  };

  return UniversityCreditOrder;
};