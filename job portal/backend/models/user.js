const { DataTypes } = require("sequelize");
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      uuid: {
        type: DataTypes.STRING(36),
        defaultValue: uuidv4,
        allowNull: false,
        unique: true,
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      phone: { type: DataTypes.STRING, allowNull: false },

      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      user_role: {
        type: DataTypes.ENUM("STUDENT", "COMPANY", "UNIVERSITY"),
        defaultValue: "STUDENT",
      },
      status: {
        type: DataTypes.INTEGER,
        defaultValue: 0, // 0 means profile incomplete, 1 means email otp verified but details not filled, 2 means complete details filled
      },
      google_id: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true,
      },
      accepted_terms_at: {
        type: DataTypes.DATE,
        allowNull: true, // user hasn't accepted yet
      },

      dob: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      gender: {
        type: DataTypes.ENUM('male', 'female', 'other'),
        allowNull: true
      }
    },
    {
      tableName: "users",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      hooks: {
        beforeCreate: async (user) => {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        },
        beforeUpdate: async (user) => {
          if (user.changed("password")) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
      },
    }
  );

  //  Add instance method for password comparison
  User.prototype.isValidPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

  User.associate = function (models) {
    User.hasOne(models.UserDetail, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
    });
    User.hasOne(models.UniversityDetail, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
    });
    User.hasMany(models.UserSkill, {
      foreignKey: "user_id",
      sourceKey: "id",
      onDelete: "CASCADE",
    });

    
    User.hasMany(models.JobPost, { foreignKey: "user_id" });

    // Add association to CompanyRecruiterProfile
    User.hasOne(models.CompanyRecruiterProfile, { foreignKey: "user_id" });

    User.hasMany(models.FeedPost, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
    });

    User.belongsToMany(models.User, {
      through: models.Follow,
      as: "Followers",
      foreignKey: "followed_id",
      otherKey: "follower_id",
    });
    User.belongsToMany(models.User, {
      through: models.Follow,
      as: "Following",
      foreignKey: "follower_id",
      otherKey: "followed_id",
    });

    User.hasOne(models.OTP, {
      foreignKey: "user_id", // Match the OTP model's field name
      onDelete: "CASCADE",
      as: "otp",
    });

    User.hasMany(models.ConversationParticipant, {
      foreignKey: "user_id",
      as: "conversations",
    });

    // User <-> Message (One to Many)
    User.hasMany(models.Message, {
      foreignKey: "sender_id",
      as: "sentMessages",
    });
  };

  return User;
};
