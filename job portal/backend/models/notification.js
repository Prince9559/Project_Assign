const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Notification = sequelize.define(
    "Notification",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users", 
          key: "id",
        },
        onDelete: "CASCADE",
      },
      user_role: {
        type: DataTypes.ENUM("STUDENT", "COMPANY", "UNIVERSITY"),
        allowNull: false,
        defaultValue: "STUDENT",
        comment: "Denormalized for performance (matches users.user_role)",
      },
      type: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: "e.g., application_received, job_posted, welcome_student",
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      action_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: "Frontend route (e.g., /dashboard/jobs/123)",
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      is_archived: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Flexible payload (e.g., { job_id: 123, applicant_name: 'test Student' })",
      },
    },
    {
      tableName: "notifications",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          name: "idx_user_status",
          fields: ["user_id", "is_read", "created_at"],
        },
        {
          name: "idx_user_role",
          fields: ["user_id", "user_role"],
        },
      ],
    }
  );

  // Associations
  Notification.associate = (models) => {
    //  Belongs to User (using your existing `users` table)
    Notification.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
      onDelete: "CASCADE",
    });
  };

  //  Instance method: Mark as read
  Notification.prototype.markAsRead = async function () {
    return await this.update({ is_read: true });
  };

  // Scopes for common queries
  Notification.addScope("unread", {
    where: {
      is_read: false,
      is_archived: false,
    },
    order: [["created_at", "DESC"]],
  });

  Notification.addScope("recent", (limit = 10) => ({
    limit,
    order: [["created_at", "DESC"]],
  }));

  return Notification;
};