module.exports = (sequelize, DataTypes) => {
    const Industry = sequelize.define("Industry", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '0=Pending, 1=Approved, 2=Rejected'
        }
    }, {
        tableName: "industries",
        freezeTableName: true,
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at"
    });

    Industry.associate = function (models) {
        Industry.hasMany(models.CompanyRecruiterProfile, {
            foreignKey: 'industry_id',
            as: 'companyRecruiterProfiles'
        });
    };
    return Industry;
};