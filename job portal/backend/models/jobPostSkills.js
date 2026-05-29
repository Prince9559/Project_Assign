module.exports = (sequelize, DataTypes) => {
  const JobPostSkill = sequelize.define(
    "JobPostSkill",
    {
      job_post_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "jobposts",
          key: "job_id",
        },
        primaryKey: true,
      },
      skill_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "skills",
          key: "skill_id",
        },
        primaryKey: true,
      },
      type: {
        type: DataTypes.ENUM("must_have", "preferred"),
        allowNull: false,
        defaultValue: "preferred",
      },
      min_experience_months: {
        type: DataTypes.INTEGER,
        allowNull: true, 
        validate: {
          min: 0,
          max: 360, // 30 years max
        },
      },
    },
    {
      tableName: "job_post_skills",
      timestamps: false,
      freezeTableName: true,
    }
  );

  JobPostSkill.associate = function (models) {
    JobPostSkill.belongsTo(models.Skill, {
      foreignKey: "skill_id",
      as: "Skill", // ← this enables `as: 'Skill'` in include
    });
  };


  return JobPostSkill;
};
