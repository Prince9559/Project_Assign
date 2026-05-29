module.exports = (sequelize, DataTypes) => {
  const PaymentOrder = sequelize.define(
    "PaymentOrder",
    {
      order_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      purchase_type: {
        type: DataTypes.ENUM("subscription", "one_time_post"),
        allowNull: false,
      },
      plan_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      billing_cycle: {
        type: DataTypes.ENUM("monthly", "yearly"),
        allowNull: true,
        defaultValue: null,
      },
      post_type: {
        type: DataTypes.ENUM("active", "future", "college"),
        allowNull: true,
        defaultValue: null,
      },
      job_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      college_ids: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      tax_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      razorpay_order_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: null,
      },
      status: {
        type: DataTypes.ENUM(
          "created",
          "paid",
          "failed",
          "expired",
          "refunded"
        ),
        allowNull: true,
        defaultValue: "created",
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      subscription_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "For subscription payments",
      },
      is_subscription_payment: {
        type: DataTypes.TINYINT(1),
        allowNull: true,
        defaultValue: 0,
      },
    },
    {
      tableName: "payment_orders",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      underscored: true,
      freezeTableName: true,
      indexes: [
        { fields: ["razorpay_order_id"] },
        { fields: ["company_id", "status"] },
        { fields: ["status"] },
      ],
    }
  );

  PaymentOrder.associate = function (models) {
    PaymentOrder.belongsTo(models.CompanyRecruiterProfile, {
      foreignKey: "company_id",
      as: "company",
    });

    PaymentOrder.belongsTo(models.Plan, {
      foreignKey: "plan_id",
      as: "plan",
    });

    PaymentOrder.belongsTo(models.JobPost, {
      foreignKey: "job_id",
      as: "job",
    });

    PaymentOrder.hasMany(models.PaymentTransaction, {
      foreignKey: "order_id",
      as: "transactions",
    });
  

   PaymentOrder.belongsTo(models.CompanySubscription, {
      foreignKey: "subscription_id",
      as: "subscription",
      allowNull: true,
      onDelete: "SET NULL",
    });
  };
  return PaymentOrder;
};
