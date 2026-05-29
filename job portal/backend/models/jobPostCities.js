module.exports = (sequelize, DataTypes) => {
    const JobPostCity = sequelize.define('JobPostCity', {
        job_post_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'job_posts',
                key:'job_id'
            },
            primaryKey:true
        },
        city_id: {
            type:DataTypes.INTEGER,
            allowNull:false,
            references:{
                model:'locations',
                key:'id'
            },
            primaryKey:true
        }
    }, {
        tableName: 'job_post_cities',
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['job_post_id', 'city_id'],
                name: 'jobpostcity_composite_idx'
            },
            {
                fields: ['job_post_id'],
                name: 'jobpostcity_jobpost_idx'
            },
            {
                fields: ['city_id'],
                name: 'jobpostcity_city_idx'
            }
        ]
    });
    return JobPostCity;
}