// module.exports = (sequelize, DataTypes) => {
//   const PathwayStep = sequelize.define(
//     "PathwayStep",
//     {
//       step_id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//       },
//       pathway_id: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         references: {
//           model: "user_pathways",
//           key: "pathway_id",
//         },
//         onDelete: "CASCADE",
//       },
//       resource_id: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         references: {
//           model: "learning_resources",
//           key: "resource_id",
//         },
//         onDelete: "RESTRICT",
//       },
//       step_order: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//       },
//       skills_to_learn: {
//         type: DataTypes.JSON,
//         allowNull: false,
//         get() {
//           const rawValue = this.getDataValue("skills_to_learn");
//           return Array.isArray(rawValue)
//             ? rawValue
//             : JSON.parse(rawValue || "[]");
//         },
//       },
//       expected_duration: {
//         type: DataTypes.DECIMAL(5, 2),
//         allowNull: false,
//       },
//       status: {
//         type: DataTypes.ENUM("pending", "in_progress", "completed", "skipped"),
//         defaultValue: "pending",
//       },
//       started_at: {
//         type: DataTypes.DATE,
//         allowNull: true,
//       },
//       completed_at: {
//         type: DataTypes.DATE,
//         allowNull: true,
//       },
//       completion_percentage: {
//         type: DataTypes.DECIMAL(5, 2),
//         defaultValue: 0.0,
//       },
//     },
//     {
//       tableName: "pathway_steps",
//       timestamps: true,
//       createdAt: "created_at",
//       updatedAt: false,
//     }
//   );

//   PathwayStep.associate = function (models) {
//     PathwayStep.belongsTo(models.UserPathway, {
//       foreignKey: "pathway_id",
//       as: "pathway",
//     });

//     PathwayStep.belongsTo(models.LearningResource, {
//       foreignKey: "resource_id",
//       as: "resource",
//     });
//   };

//   return PathwayStep;
// };





























// models/PathwayStep.js - Updated version
module.exports = (sequelize, DataTypes) => {
  const PathwayStep = sequelize.define(
    "PathwayStep",
    {
      step_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      pathway_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "user_pathways",
          key: "pathway_id",
        },
        onDelete: "CASCADE",
      },
      step_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "1, 2, 3, ... order in pathway",
      },
      
      // Resource reference
      resource_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // Can be NULL if resource is missing/placeholder
        references: {
          model: "learning_resources",
          key: "resource_id",
        },
        onDelete: "SET NULL",
      },
      
      // Metadata (stored for display even if resource deleted)
      resource_type: {
        type: DataTypes.ENUM("course", "project", "internship", "job"),
        allowNull: false,
      },
      resource_title: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      resource_missing: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: "TRUE if this is a placeholder for missing resource",
      },
      
      // Step details
      duration_months: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
      },
      
      // Skills gained in this step (JSON array)
      skills_gained: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Array of {skill_id, skill_name, experience_months}",
        get() {
          const rawValue = this.getDataValue("skills_gained");
          return rawValue ? (typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue) : [];
        },
      },
      
      // Prerequisites met?
      prerequisites_met: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: "Does user meet prerequisites at this step?",
      },
      
      // Why this step is needed
      step_reasoning: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "E.g., 'Adds React skill with 6 months experience (required: 12 months)'",
      },
      
      // Status
      status: {
        type: DataTypes.ENUM("pending", "in_progress", "completed", "skipped"),
        defaultValue: "pending",
      },
      
      started_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      completed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "pathway_steps",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  PathwayStep.associate = function (models) {
    PathwayStep.belongsTo(models.UserPathway, {
      foreignKey: "pathway_id",
      as: "pathway",
    });

    PathwayStep.belongsTo(models.LearningResource, {
      foreignKey: "resource_id",
      as: "resource",
    });
  };

  return PathwayStep;
};
