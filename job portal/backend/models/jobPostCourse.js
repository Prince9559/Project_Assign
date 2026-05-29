module.exports = (sequelize, DataTypes) => {
    const JobPostCourse = sequelize.define('JobPostCourse', {
        job_post_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'jobposts',
                key: 'job_id'
            },
            primaryKey: true
        },
        course_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'courses',
                key: 'id'
            },
            primaryKey: true
        }
    }, {
        tableName: 'job_post_courses',
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['job_post_id', 'course_id'],
                name: 'jobpostcourse_composite_idx'
            },
            {
                fields: ['job_post_id'],
                name: 'jobpostcourse_jobpost_idx'
            },
            {
                fields: ['course_id'],
                name: 'jobpostcourse_course_idx'
            }
        ]
    });
    return JobPostCourse;
};