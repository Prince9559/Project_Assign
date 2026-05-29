module.exports = (sequelize, DataTypes) => {
    const Language = sequelize.define('Language', {
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
    }, {
        tableName: 'languages',
        timestamps: false,
        underscored: true,
        freezeTableName: true,
        indexes: [
            {
                fields: ['name']
            }
        ]
    });

    Language.associate = function (models) {
        Language.belongsToMany(models.CompanyRecruiterProfile, {
            through: 'company_languages',
            as: 'companyProfiles',
            foreignKey: 'language_id',
            otherKey: 'company_recruiter_profile_id'
        });
    };

    return Language;
};