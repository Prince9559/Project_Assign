const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const Application = require("./application");

module.exports = (sequelize, DataTypes) => {
  const InterviewInvitation = sequelize.define(
    "InterviewInvitation",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      application_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: Application,
          key: "id",
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      status: {
        // allowed status 'Scheduled, Rescheduled, Completed, Cancelled, No-show'
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "Scheduled",
      },
      // interview_type: {
      //   type: DataTypes.ENUM("videocall", "phone", "inoffice"),
      //   allowNull: false,
      // },

      interview_type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "In-office",
        validate: {
          isIn: {
            args: [["Video call", "Phone", "In-office"]],
            msg: "interview_type must be 'Video call', 'Phone', or 'In-office'",
          },
        },
      },
      interview_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      start_time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      end_time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      video_link: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone_number: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      office_address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      scheduled_notification_sent_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      reminder_notification_sent_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "interview_invitations",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  InterviewInvitation.associate = (models) => {
    InterviewInvitation.belongsTo(models.Application, {
      foreignKey: "application_id",
    });
  };

  return InterviewInvitation;
};
