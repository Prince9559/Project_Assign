module.exports = (sequelize, DataTypes) => {
  const CompanySubscription = sequelize.define(
    "CompanySubscription",
    {
      subscription_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      plan_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      razorpay_subscription_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
        comment: "Razorpay subscription ID",
      },
      razorpay_plan_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      razorpay_customer_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      billing_cycle: {
        type: DataTypes.ENUM("monthly", "yearly", "one_time"),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(
          "active",
          "paused",
          "halted",
          "cancelling",
          "cancelled",
          "expired",
          "completed",
          "pending",
          "created",
          "authenticated"
        ),
        allowNull: false,
        defaultValue: "created",
      },
      start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      current_period_start: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      current_period_end: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      next_billing_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      cancel_at: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: "Scheduled cancellation date (if cancel_at_cycle_end=true)",
      },
      last_payment_failed_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Timestamp of last failed auto-charge attempt",
      },
      cancelled_at: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        defaultValue: null,
      },
      total_credits: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      used_credits: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      remaining_credits: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      college_ids: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null,
      },
      college_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      amount_per_cycle: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      auto_renew: {
        type: DataTypes.TINYINT(1),
        allowNull: true,
        defaultValue: 1,
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Store plan snapshot and other details",
      },
    },
    {
      tableName: "company_subscriptions",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { fields: ["company_id", "status"] },
        { fields: ["razorpay_subscription_id"] },
        { fields: ["next_billing_date"] },
        { fields: ["status"] },
      ],
    }
  );

  CompanySubscription.associate = function (models) {
    // Belongs to Company & Plan
    CompanySubscription.belongsTo(models.CompanyRecruiterProfile, {
      foreignKey: "company_id",
      as: "company",
      onDelete: "CASCADE",
    });

    CompanySubscription.belongsTo(models.Plan, {
      foreignKey: "plan_id",
      as: "plan",
      onDelete: "RESTRICT",
    });

    // Has many Credit Logs
    CompanySubscription.hasMany(models.SubscriptionCreditLog, {
      foreignKey: "subscription_id",
      as: "creditLogs",
      onDelete: "CASCADE",
    });

    // Has many PaymentOrders (subscription payments)
    CompanySubscription.hasMany(models.PaymentOrder, {
      foreignKey: "subscription_id",
      as: "payments",
      onDelete: "SET NULL", // matching your DB FK
    });

    // Optional: Can link to jobs (via job_postings.subscription_id)
    CompanySubscription.hasMany(models.JobPost, {
      foreignKey: "subscription_id",
      as: "jobs",
      onDelete: "SET NULL",
    });
  };

  // Helper: Is subscription currently valid (non-expired & active/pending)?
  CompanySubscription.prototype.isActive = function () {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const periodEnd = this.current_period_end
      ? new Date(this.current_period_end)
      : null;

    // Allow access during: active, paused, cancelling — as long as period hasn't ended
    return (
      ["active", "paused", "cancelling"].includes(this.status) &&
      periodEnd &&
      periodEnd >= today
    );
  };

  // Helper: Get remaining credits
  CompanySubscription.prototype.getRemainingCredits = function () {
    return this.remaining_credits;
  };


  // Helper: Check if bundle is usable (active, non-expired, has credits)
  CompanySubscription.prototype.isUsableForCollegePost = function (collegeCount) {
    if (!["active", "pending"].includes(this.status)) return false;
    if (this.remaining_credits < collegeCount) return false;
    if (this.current_period_end) {
      const expiry = new Date(this.current_period_end);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (expiry < today) return false;
    }
    return true;
  };

  return CompanySubscription;
};










































//to add later on
// CompanySubscription.addHook("beforeUpdate", async (subscription) => {
//   const { status, previous } = subscription;

//   // Prevent invalid transitions
//   const invalidTransitions = {
//     cancelled: ["active", "paused", "cancelling"], // can't resurrect
//     completed: ["active", "paused"], // immutable end state
//     expired: ["active"], // expired → can't go back
//   };

//   if (previous && invalidTransitions[status]?.includes(previous.status)) {
//     throw new Error(`Invalid transition: ${previous.status} → ${status}`);
//   }

//   // Enforce: cancel_at must be set for 'cancelling'
//   if (status === "cancelling" && !subscription.cancel_at) {
//     throw new Error("cancel_at is required for 'cancelling' status");
//   }
// });
