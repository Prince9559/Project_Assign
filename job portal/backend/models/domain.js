module.exports = (sequelize, DataTypes) => {
  const Domain = sequelize.define('Domain', {
    domain_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    domain_name: {
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
    tableName: 'domains',
    timestamps: false
  });


  Domain.associate = (models) => {
    //to decide wehther to keep teh association or not this domain skillsone because many table not using
    Domain.hasMany(models.Skill, {
      foreignKey: 'domain_id',
      as: 'skills'
    });
    Domain.belongsToMany(models.JobRole, {
      through: models.JobRoleDomain,
      foreignKey: 'domain_id',
      otherKey: 'job_role_id',
      as: 'jobRoles'
    });
  };

  return Domain;
};
