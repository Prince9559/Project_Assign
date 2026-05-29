module.exports = (sequelize, DataTypes) => {
  const UserSkill = sequelize.define(
    "UserSkill",
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      skill_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Skills",
          key: "skill_id",
        },
        onDelete: "CASCADE",
      },
      certificate_image: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      skill: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      authority_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "authorities", //CHANGED TO 'authorities'
          key: "id",
        },
        onDelete: "CASCADE",
      },
      authority_type: {
        type: DataTypes.ENUM("COMPANY", "UNIVERSITY"),
        allowNull: true, // allow null
      },
      start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      experience_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "experiences",
          key: "id",
        },
        onDelete: "SET NULL",
      },
      experience_months: {
        type: DataTypes.INTEGER,
        allowNull: true, // or false if required; recommend allowing null initially
        validate: {
          min: 0,
        },
      },
    },
    {
      tableName: "user_skills",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    }
  );

  UserSkill.associate = function (models) {
    UserSkill.belongsTo(models.User, {
      foreignKey: "user_id",
      targetKey: "id",
      onDelete: "CASCADE",
    });

    UserSkill.belongsTo(models.Skill, {
      foreignKey: "skill_id",
      targetKey: "skill_id",
      as: "Skill",
    });

    UserSkill.belongsTo(models.Authority, {
      // changed from CompanyRecruiterProfile TO Authority
      foreignKey: "authority_id",
      onDelete: "CASCADE",
    });

     UserSkill.belongsTo(models.Experience, {
       foreignKey: "experience_id",
       onDelete: "SET NULL",
     });
  };

  return UserSkill;
};
