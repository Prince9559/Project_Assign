//table for student details don't go on name of the table , it stores the studetn details
module.exports = (sequelize, DataTypes) => {
  const UserDetail = sequelize.define(
    "UserDetail",
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      first_name: { type: DataTypes.STRING, allowNull: false },
      last_name: { type: DataTypes.STRING, allowNull: false },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      phone: { type: DataTypes.STRING, allowNull: false },
      dob: { type: DataTypes.DATEONLY, allowNull: false },

      aadhaar_number: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      aadhaar_card_file: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_aadhaar_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      current_location_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "locations",
          key: "id",
        },
      },
      job_location_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "locations",
          key: "id",
        },
      },
      gender: { type: DataTypes.STRING, allowNull: false },

      user_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      //used in ai-prediction
      user_category: { 
        type: DataTypes.ENUM(
          "currently_studying",
          "fresher",
          "working_professional"
        ),
        allowNull: false,
        defaultValue: "currently_studying",
      },

      // Removed education-related fields: Standard, course, specialization, college, start_year, end_year
      // These are now handled in the educations table

      salary_details: DataTypes.STRING,
      currently_looking_for: DataTypes.STRING,
      work_mode: DataTypes.STRING,

      about_us: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      career_objective: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      resume: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      language: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_phone_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      //to remove this field as this user detail table is for student
      is_gst_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      user_profile_pic: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      terms_and_condition: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "user_details",
      timestamp: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  UserDetail.associate = function (models) {
    UserDetail.belongsTo(models.User, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
    });
    UserDetail.hasMany(models.Experience, {
      foreignKey: "user_detail_id",
      as: "experiences",
    });
    UserDetail.hasMany(models.Education, {
      foreignKey: "user_detail_id",
      as: "userEducations",
    });
    UserDetail.belongsTo(models.Location, {
      as: "currentLocation",
      foreignKey: "current_location_id",
    });
    UserDetail.belongsTo(models.Location, {
      as: "jobLocation",
      foreignKey: "job_location_id",
    });
  };

  return UserDetail;
};
