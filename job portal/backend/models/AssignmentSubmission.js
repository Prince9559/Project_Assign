// File: /models/AssignmentSubmission.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AssignmentSubmission = sequelize.define(
    'AssignmentSubmission',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      assignment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'assignments',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      student_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      text_response: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      file_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      submitted_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'assignment_submissions',
      timestamps: false, 
    }
  );

  AssignmentSubmission.associate = (models) => {
    AssignmentSubmission.belongsTo(models.Assignment, {
      foreignKey: 'assignment_id',
      as: 'assignment',
    });
    AssignmentSubmission.belongsTo(models.User, {
      foreignKey: 'student_id',
      as: 'student',
    });
  };

  return AssignmentSubmission;
};

