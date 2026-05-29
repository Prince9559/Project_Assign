const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const JobRole = sequelize.define(
    "JobRole",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '0=Pending, 1=Approved, 2=Rejected'
  }
    },
    {
      tableName: "job_roles",
      timestamps: false,
      indexes: [
        {
          fields: ["title"],
        },
      ],
    }
  );

  JobRole.associate = (models) => {
    JobRole.hasMany(models.JobPost, { foreignKey: 'job_role_id' });
    JobRole.hasMany(models.Experience, {
      foreignKey: 'job_role_id',
      as: 'experiences'
    });
    JobRole.belongsToMany(models.Domain, {
      through: models.JobRoleDomain,
      foreignKey: 'job_role_id',
      otherKey: 'domain_id',
      as: 'suggestedDomains'
    });
  };

  return JobRole;
};
