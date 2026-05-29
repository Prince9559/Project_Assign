module.exports = (sequelize, DataTypes) => {
  const SchoolCollege = sequelize.define('SchoolCollege', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    logo_pic: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      comment: '0=Pending, 1=Approved, 2=Rejected'
    }
  }, {
    tableName: 'school_colleges',
    timestamps: false
  });

  SchoolCollege.associate = function (models) {
    // Many-to-Many with JobPost via JobPostCollege
    SchoolCollege.belongsToMany(models.JobPost, {
      through: models.JobPostCollege,
      foreignKey: 'college_id',
      otherKey: 'job_post_id',
      as: 'jobPosts'
    });

    SchoolCollege.hasMany(models.Education, {
      foreignKey: 'school_college_id',
      as: 'schoolCollegeEducations'
    });
  };

  return SchoolCollege;
};
