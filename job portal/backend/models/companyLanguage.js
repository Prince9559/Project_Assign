// models/companyLanguage.js
module.exports = (sequelize, DataTypes) => {
    const CompanyLanguage = sequelize.define('CompanyLanguage', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        company_recruiter_profile_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'company_recruiter_profiles',
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        language_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'languages',
                key: 'id'
            },
            onDelete: 'CASCADE'
        }
    }, {
        tableName: 'company_languages',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                unique: true,
                fields: ['company_recruiter_profile_id', 'language_id']
            }
        ]
    });

    return CompanyLanguage;
};