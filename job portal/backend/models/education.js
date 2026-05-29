const { DataTypes } = require("sequelize");
const sequelize = require("../db");

module.exports = (sequelize, DataTypes) => {
  const Education = sequelize.define(
    "Education",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_detail_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "user_details",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      level: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      school_college_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "school_colleges",
          key: "id",
        },
      },
      board_or_university: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      other_institution_name: {
        type: DataTypes.STRING,
        allowNull: true, 
      },
      standard_or_grade: {
        type: DataTypes.STRING,
        allowNull: true, 
      },
      course_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "courses",
          key: "id",
        },
      },
      specialization_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "specializations",
          key: "id",
        },
      },
      start_date: {
        type: DataTypes.DATEONLY, 
        allowNull: true,
      },
      end_date: {
        type: DataTypes.DATEONLY, 
        allowNull: true,
      },
      percentage_or_cgpa: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      education_certificate: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "education_certificate",
      },
      approval_status: {
        type: DataTypes.ENUM("approved", "pending", "rejected"),
        allowNull: false,
        defaultValue: "approved",
      },
      removed_by_university: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      removal_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      proof_document: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      reapproval_requested: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      approved_by_university_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "educations",
      timestamp: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  Education.associate = function (models) {
    Education.belongsTo(models.UserDetail, {
      foreignKey: "user_detail_id",
      as: "userDetail",
    });
    Education.belongsTo(models.SchoolCollege, {
      foreignKey: "school_college_id",
      as: "schoolCollegeEducations",
    });
    Education.belongsTo(models.Course, {
      foreignKey: "course_id",
      as: "educationCourse",
    });
    Education.belongsTo(models.Specialization, {
      foreignKey: "specialization_id",
      as: "educationSpecialization",
    });
  };

  return Education;
};
