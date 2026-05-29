const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const FilterOption = sequelize.define('FilterOption', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['duration', 'perks']]
      }
    },
    value: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'filter_options',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['category']
      },
      {
        fields: ['is_active']
      }
    ]
  });

  FilterOption.associate = function(models) {
    FilterOption.hasMany(models.JobPost, {
      foreignKey: 'duration_id',
      as: 'duration_job_posts',
      scope: { category: 'duration' }
    });
    
  };

  return FilterOption;
};