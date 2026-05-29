module.exports = (sequelize, DataTypes) => {
  const SubscriptionCreditLog = sequelize.define(
    "SubscriptionCreditLog",
    {
      log_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      subscription_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      action_type: {
        type: DataTypes.ENUM("allocated", "used", "refunded", "reset"),
        allowNull: false,
      },
      credits_before: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      credits_changed: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "Positive for add, negative for deduct",
      },
      credits_after: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      job_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "If used for job posting",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "subscription_credit_logs",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false, // only created_at
      indexes: [
        { fields: ["subscription_id"] },
        { fields: ["company_id"] },
        { fields: ["action_type"] },
      ],
    }
  );

  SubscriptionCreditLog.associate = function (models) {
    SubscriptionCreditLog.belongsTo(models.CompanySubscription, {
      foreignKey: "subscription_id",
      as: "subscription",
      onDelete: "CASCADE",
    });

    SubscriptionCreditLog.belongsTo(models.CompanyRecruiterProfile, {
      foreignKey: "company_id",
      as: "company",
      onDelete: "CASCADE",
    });

    SubscriptionCreditLog.belongsTo(models.JobPost, {
      foreignKey: "job_id",
      as: "job",
      allowNull: true,
      onDelete: "SET NULL",
    });
  };

  return SubscriptionCreditLog;
};