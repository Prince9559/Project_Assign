module.exports = (sequelize, DataTypes) => {
    const UniversityCourse = sequelize.define(
        'UniversityCourse',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            university_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'UniversityDetails',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            course_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Courses', 
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
            updated_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                onUpdate: DataTypes.NOW,
            },
        },
        {
            tableName: 'university_courses',
            timestamps: false,
            underscored: true,
        }
    );

    return UniversityCourse;
};
