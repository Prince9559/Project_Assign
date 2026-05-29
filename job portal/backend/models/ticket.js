// models/SupportTicket.js
module.exports = (sequelize, DataTypes) => {
    const SupportTicket = sequelize.define('SupportTicket', {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        name: DataTypes.STRING,
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM('STUDENT', 'COMPANY', 'UNIVERSITY'),
            allowNull: false,
        },
        issue_title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        issue_detail: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        priority: {
            type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH'),
            defaultValue: 'MEDIUM',
        },
        status: {
            type: DataTypes.ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'),
            defaultValue: 'OPEN',
        },
    }, {
        tableName: 'support_tickets',
        timestamps: true,
        createdAt: "created_at",
      updatedAt: "updated_at",
    });

    //Associations
    // Associations
    SupportTicket.associate = (models) => {
        SupportTicket.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user'
        });
        models.User.hasMany(SupportTicket, {
            foreignKey: 'user_id',
            as: 'supportTickets'
        });
    };
    return SupportTicket;
};
