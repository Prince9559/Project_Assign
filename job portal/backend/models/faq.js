// FAQ model for frequently asked questions for different roles
module.exports = (sequelize, DataTypes) => {
    const FAQ = sequelize.define('FAQ', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        role: {
            type: DataTypes.ENUM('STUDENT', 'COMPANY', 'UNIVERSITY'),
            allowNull: false
        },
        question: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        answer: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'faqs',
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    });
    return FAQ;
};
