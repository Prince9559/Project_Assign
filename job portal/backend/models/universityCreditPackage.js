// models/UniversityCreditPackage.js
module.exports = (sequelize, DataTypes) => {
  const UniversityCreditPackage = sequelize.define(
    "UniversityCreditPackage",
    {
      package_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      credits: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      price_inr: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      validity_days: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
      },
      display_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      tax_rate_percent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 18.0,
        comment: "GST % (e.g., 18.00 for 18%)",
      },
      meta: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null,
        comment:
          "Extensible config: { max_unlocks_per_day: 10, features: [...] }",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "university_credit_packages",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [{ fields: ["is_active"] }, { fields: ["display_order"] }],
    }
  );

  return UniversityCreditPackage;
};
