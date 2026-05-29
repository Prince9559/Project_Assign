module.exports = (sequelize, DataTypes) => {
  const Experience = sequelize.define(
    "Experience",
    {
      user_detail_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "UserDetails",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      company_recruiter_profile_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "company_recruiter_profiles",
          key: "id",
        },
        onDelete: "SET NULL",
      },
      start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true, // nullable for current jobs
      },
      job_role_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "job_roles",
          key: "id",
        },
        onDelete: "SET NULL",
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
      // In Experience model
      organization_name: {
        type: DataTypes.STRING,
        allowNull: true, // will be NULL if authority_id is used
      },
      status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "pending", // e.g., pending, approved, rejected
      },
      approval_status: {
        type: DataTypes.ENUM("approved", "pending", "rejected"),
        allowNull: false,
        defaultValue: "approved",
      },
      removed_by_company: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      removal_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      proof_document: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      reapproval_requested: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      approved_by_company_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      experienceCertificate: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "experience_certificate", // Map to database column name
      },
      authority_id: {
        type: DataTypes.INTEGER,
        allowNull: true, 
        references: {
          model: "authorities",
          key: "id",
        },
        onDelete: "CASCADE",
      },
    },
    {
      tableName: "experiences",
      timestamp: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  Experience.associate = (models) => {
    Experience.belongsTo(models.UserDetail, {
      foreignKey: "user_detail_id",
      onDelete: "CASCADE",
    });
    Experience.belongsTo(models.CompanyRecruiterProfile, {
      foreignKey: "company_recruiter_profile_id",
      as: "companyRecruiterProfile",
      onDelete: "SET NULL",
    });
    Experience.belongsTo(models.JobRole, {
      foreignKey: "job_role_id",
      as: "jobRole",
      onDelete: "SET NULL",
    });

    // NEW
    Experience.belongsTo(models.Authority, {
      foreignKey: "authority_id",
      onDelete: "CASCADE",
    });
  };

  return Experience;
};

//will be removing one of them company_id or company_recruiter profile  as it is redundant
