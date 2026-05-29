module.exports = (sequelize, DataTypes) => {
  const OneTimePurchase = sequelize.define(
    "OneTimePurchase",
    {
      purchase_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      post_type: {
        type: DataTypes.ENUM("active", "future", "college"),
        allowNull: false,
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
      college_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      amount_paid: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      payment_status: {
        type: DataTypes.ENUM("pending", "paid", "failed", "refund"),
        allowNull: true,
        defaultValue: "pending",
      },
    },
    {
      tableName: "one_time_purchases",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
      indexes: [
        { fields: ["company_id"] },
        { fields: ["job_id"] },
        { fields: ["payment_status"] },
      ],
    }
  );

  OneTimePurchase.associate = function (models) {
    OneTimePurchase.belongsTo(models.CompanyRecruiterProfile, {
      foreignKey: "company_id",
      as: "company",
    });

    OneTimePurchase.belongsTo(models.JobPost, {
      foreignKey: "job_id",
      as: "job",
    });
  };

  return OneTimePurchase;
};
