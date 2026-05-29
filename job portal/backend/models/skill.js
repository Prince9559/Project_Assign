module.exports = (sequelize, DataTypes) => {
  const Skill = sequelize.define('Skill', {
    skill_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    domain_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Domains',
        key: 'domain_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    skill_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      comment: '0=Pending, 1=Approved, 2=Rejected'
    }
  }, {
    tableName: 'skills',
    timestamps: false
  });

  Skill.associate = (models) => {
    Skill.belongsTo(models.Domain, {
      foreignKey: 'domain_id',
      as: 'domain'
    });
    Skill.hasMany(models.UserSkill, {
      foreignKey: 'skill_id',
      as: 'userSkills'
    });
    Skill.belongsToMany(models.JobPost, {
      through: 'jobpost_skills',
      foreignKey: 'skill_id',
      as: 'jobPosts'
    });
  };

  return Skill;
};
