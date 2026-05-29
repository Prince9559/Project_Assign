// models/Authority.js
module.exports = (sequelize, DataTypes) => {
  const Authority = sequelize.define(
    "Authority",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      authority_type: {
        type: DataTypes.ENUM("COMPANY", "UNIVERSITY"),
        allowNull: false,
      },
      company_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "company_recruiter_profiles",
          key: "id",
        },
        onDelete: "SET NULL",
      },
      school_college_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "school_colleges",
          key: "id",
        },
        onDelete: "SET NULL",
      },
    },
    {
      tableName: "authorities",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  Authority.associate = function (models) {
    Authority.belongsTo(models.CompanyRecruiterProfile, {
      foreignKey: "company_id",
    });
    Authority.belongsTo(models.SchoolCollege, {
      foreignKey: "school_college_id",
    });
  };

  return Authority;
};