module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
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
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      comment: '0=Pending, 1=Approved, 2=Rejected'
    }
  }, {
    tableName: 'courses',
    timestamps: false
  });

  Course.associate = function (models) {
    // Education still belongs to Course
    Course.hasMany(models.Education, {
      foreignKey: 'course_id',
      as: 'educations'
    });

    // Many-to-Many with JobPost via JobPostCourse
    Course.belongsToMany(models.JobPost, {
      through: models.JobPostCourse,
      foreignKey: 'course_id',
      otherKey: 'job_post_id',
      as: 'jobPosts'
    });

    // Many-to-Many with UniversityDetail through UniversityCourse
    Course.belongsToMany(models.UniversityDetail, {
      through: 'UniversityCourse',
      foreignKey: 'course_id',
      otherKey: 'university_id',
      as: 'universities'
    });

    Course.hasMany(models.Specialization, {
      foreignKey: 'course_id',
      as: 'specializations'
    });
  };

  return Course;
};
