// module.exports = (sequelize, DataTypes) => {
//   const UserPathway = sequelize.define(
//     "UserPathway",
//     {
//       pathway_id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//       },
//       user_id: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         references: {
//           model: "users",
//           key: "id",
//         },
//         onDelete: "CASCADE",
//       },
//       strategy_type: {
//         type: DataTypes.ENUM(
//           "job_specific",
//           "company_target",
//           "direct_upskilling",
//           "company_role_target"
//         ),
//         allowNull: false,
//       },
//       target_job_id: {
//         type: DataTypes.INTEGER,
//         allowNull: true,
//         references: {
//           model: "job_posts",
//           key: "job_id",
//         },
//         onDelete: "SET NULL",
//       },
//       target_company_id: {
//         type: DataTypes.INTEGER,
//         allowNull: true,
//       },
//       target_company_ids: {
//         type: DataTypes.JSON,
//         allowNull: true,
//         get() {
//           const rawValue = this.getDataValue("target_company_ids");
//           return Array.isArray(rawValue)
//             ? rawValue
//             : JSON.parse(rawValue || "[]");
//         },
//       },
//       target_role_ids: {
//         type: DataTypes.JSON,
//         allowNull: true,
//         get() {
//           const rawValue = this.getDataValue("target_role_ids");
//           return Array.isArray(rawValue)
//             ? rawValue
//             : JSON.parse(rawValue || "[]");
//         },
//       },
//       target_domains: {
//         type: DataTypes.JSON,
//         allowNull: true,
//         get() {
//           const rawValue = this.getDataValue("target_domains");
//           return Array.isArray(rawValue)
//             ? rawValue
//             : JSON.parse(rawValue || "[]");
//         },
//       },
//       pathway_rank: {
//         type: DataTypes.TINYINT,
//         allowNull: false,
//       },
//       total_duration: {
//         type: DataTypes.DECIMAL(5, 2),
//         allowNull: false,
//       },
//       total_skills_covered: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//       },
//       skill_coverage_percent: {
//         type: DataTypes.DECIMAL(5, 2),
//         defaultValue: 100.0,
//       },
//       total_internships: {
//         type: DataTypes.INTEGER,
//         defaultValue: 0,
//       },
//       total_projects: {
//         type: DataTypes.INTEGER,
//         defaultValue: 0,
//       },
//       total_courses: {
//         type: DataTypes.INTEGER,
//         defaultValue: 0,
//       },
//       total_jobs: {
//         type: DataTypes.INTEGER,
//         defaultValue: 0,
//       },
//       pathway_score: {
//         type: DataTypes.DECIMAL(8, 2),
//         allowNull: false,
//       },
//       status: {
//         type: DataTypes.ENUM(
//           "suggested",
//           "selected",
//           "in_progress",
//           "completed",
//           "abandoned"
//         ),
//         defaultValue: "suggested",
//       },
//       selected_at: {
//         type: DataTypes.DATE,
//         allowNull: true,
//       },
//       started_at: {
//         type: DataTypes.DATE,
//         allowNull: true,
//       },
//       completed_at: {
//         type: DataTypes.DATE,
//         allowNull: true,
//       },
//     },
//     {
//       tableName: "user_pathways",
//       timestamps: true,
//       createdAt: "created_at",
//       updatedAt: false,
//     }
//   );

//   UserPathway.associate = function (models) {
//     UserPathway.belongsTo(models.User, {
//       foreignKey: "user_id",
//       as: "user",
//     });

//     UserPathway.belongsTo(models.JobPost, {
//       foreignKey: "target_job_id",
//       as: "targetJob",
//     });

//     UserPathway.hasMany(models.PathwayStep, {
//       foreignKey: "pathway_id",
//       as: "steps",
//     });
//   };

//   return UserPathway;
// };


















// models/UserPathway.js - Updated version
module.exports = (sequelize, DataTypes) => {
  const UserPathway = sequelize.define(
    "UserPathway",
    {
      pathway_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      
      // Target type
      target_type: {
        type: DataTypes.ENUM("job_specific", "role_specific", "upskilling"),
        allowNull: false,
      },
      
      // For job_specific
      target_job_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "job_posts",
          key: "job_id",
        },
        onDelete: "SET NULL",
      },
      
      // For role_specific
      target_role_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "E.g., 'Backend Developer', 'Full Stack Engineer'",
      },
      
      // Pathway metadata
      pathway_rank: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: "1, 2, 3 for top 3 pathways",
      },
      total_duration_months: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
      },
      
      // Skill coverage
      must_have_coverage_percent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
      },
      preferred_coverage_percent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
      },
      overall_skill_coverage_percent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
      },
      
      // Experience gained (JSON: {skill_id: experience_months, ...})
      total_experience_gained: {
        type: DataTypes.JSON,
        allowNull: true,
        get() {
          const rawValue = this.getDataValue("total_experience_gained");
          return rawValue ? (typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue) : {};
        },
      },
      
      // Counts
      total_courses: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      total_projects: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      total_internships: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      total_jobs: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      
      // Scoring
      pathway_score: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
      },
      
      // User preferences snapshot (what user selected)
      user_preferences: {
        type: DataTypes.JSON,
        allowNull: true,
        get() {
          const rawValue = this.getDataValue("user_preferences");
          return rawValue ? (typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue) : null;
        },
      },
      
      // Status
      status: {
        type: DataTypes.ENUM("active", "outdated", "selected", "in_progress", "completed", "abandoned"),
        defaultValue: "active",
      },
      
      // Cache expiry
      expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Pathway cache expiry (e.g., 7 days from generation)",
      },
      
      generated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "user_pathways",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { fields: ["user_id", "target_type", "status"] },
        { fields: ["expires_at"] },
      ],
    }
  );

  UserPathway.associate = function (models) {
    UserPathway.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });

    UserPathway.belongsTo(models.JobPost, {
      foreignKey: "target_job_id",
      as: "targetJob",
    });

    UserPathway.hasMany(models.PathwayStep, {
      foreignKey: "pathway_id",
      as: "steps",
      onDelete: "CASCADE",
    });
  };

  return UserPathway;
};

