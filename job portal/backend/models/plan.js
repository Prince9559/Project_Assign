module.exports = (sequelize, DataTypes) => {
  const Plan = sequelize.define(
    "Plan",
    {
      plan_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      plan_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      plan_slug: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          is: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, // simple slug validation (optional)
        },
      },
      plan_type: {
        type: DataTypes.ENUM("active", "future", "both", "college", "college_credits"),
        allowNull: false,
        defaultValue: "active",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      monthly_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true, // ← Now nullable (per your spec: NULL for college-specific)
      },
      yearly_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true, // ← Now nullable
      },
      monthly_credits: {
        type: DataTypes.INTEGER,
        allowNull: true, // ← Now nullable (e.g., for dynamic college plans)
        defaultValue: null,
      },
      yearly_credits: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      features: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Plan features for display",
        // Example setter/helper can be added in model methods
      },
      is_active: {
        type: DataTypes.TINYINT(1),
        allowNull: true,
        defaultValue: 1,
      },
      is_visible: {
        type: DataTypes.TINYINT(1),
        allowNull: true,
        defaultValue: 1,
        comment: "Show on pricing page",
      },
      is_featured: {
        type: DataTypes.TINYINT(1),
        allowNull: true,
        defaultValue: 0,
        comment: "Highlight on frontend",
      },
      display_order: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: "Sort order on frontend",
      },
      price_per_college_monthly: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
      },
      price_per_college_yearly: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
      },
      razorpay_plan_id_monthly: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "Razorpay subscription plan ID",
      },
      razorpay_plan_id_yearly: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "Razorpay subscription plan ID",
      },
    },
    {
      tableName: "plans",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { fields: ["plan_type"] },
        { fields: ["is_active"] },
        { fields: ["is_active", "is_visible"] },
        { fields: ["plan_slug"] },
      ],
    }
  );

  Plan.associate = function (models) {
    Plan.hasMany(models.PaymentOrder, {
      foreignKey: "plan_id",
      as: "paymentOrders",
    });
    // Add other associations here (e.g., subscriptions, users, etc.)
  };

  // Optional: Instance method to safely access features
  Plan.prototype.getFeature = function (key, fallback = null) {
    if (!this.features) return fallback;
    return this.features[key] ?? fallback;
  };

  return Plan;
};