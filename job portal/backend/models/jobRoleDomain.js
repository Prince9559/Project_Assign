// models/jobRoleDomain.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const JobRoleDomain = sequelize.define('JobRoleDomain', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    job_role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
  
    },
    domain_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'job_role_domains',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  JobRoleDomain.associate = (models) => {
    JobRoleDomain.belongsTo(models.JobRole, {
      foreignKey: 'job_role_id',
      as: 'jobRole'
    });
    JobRoleDomain.belongsTo(models.Domain, {
      foreignKey: 'domain_id',
      as: 'domain'
    });
  };

  return JobRoleDomain;
};