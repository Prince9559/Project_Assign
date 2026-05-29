module.exports = (sequelize, DataTypes) => {
  const UniversityNotificationPayment = sequelize.define(
    "UniversityNotificationPayment",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      university_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      credits_added: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      base_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },
      tax_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },
      razorpay_order_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      razorpay_payment_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("pending", "paid", "failed"),
        allowNull: false,
        defaultValue: "pending",
      },
    },
    {
      tableName: "university_notification_payments",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      underscored: true,
    }
  );

  UniversityNotificationPayment.associate = (models) => {
    UniversityNotificationPayment.belongsTo(models.UniversityDetail, {
      foreignKey: "university_id",
      as: "university",
    });
  };

  return UniversityNotificationPayment;
};
