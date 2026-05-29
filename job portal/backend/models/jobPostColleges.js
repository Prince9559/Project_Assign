module.exports = (sequelize, DataTypes) => {
    const JobPostCollege = sequelize.define('JobPostCollege', {
        job_post_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'jobposts',
                key: 'job_id'
            },
            primaryKey: true
        },
        college_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'school_colleges',
                key: 'id'
            },
            primaryKey: true
        }
    }, {
        tableName: 'job_post_colleges',
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['job_post_id', 'college_id'],
                name: 'jobpostcollege_composite_idx'
            },
            {
                fields: ['job_post_id'],
                name: 'jobpostcollege_jobpost_idx'
            },
            {
                fields: ['college_id'],
                name: 'jobpostcollege_college_idx'
            }
        ]
    });
    return JobPostCollege;
};
