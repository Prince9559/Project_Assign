module.exports = (sequelize, DataTypes) => {
  const PaymentTransaction = sequelize.define(
    "PaymentTransaction",
    {
      transaction_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      razorpay_payment_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: null,
      },
      razorpay_order_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: null,
      },
      razorpay_signature: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "success", "failed", "refunded"),
        allowNull: true,
        defaultValue: "pending",
      },
      payment_method: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: null,
      },
      payment_date: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      tableName: "payment_transactions",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
      indexes: [
        { fields: ["razorpay_payment_id"] },
        { fields: ["order_id"] },
        { fields: ["company_id"] },
      ],
    }
  );

  PaymentTransaction.associate = function (models) {
    PaymentTransaction.belongsTo(models.PaymentOrder, {
      foreignKey: "order_id",
      as: "order",
    });

    PaymentTransaction.belongsTo(models.CompanyRecruiterProfile, {
      foreignKey: "company_id",
      as: "company",
    });
  };

  return PaymentTransaction;
};
