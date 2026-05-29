module.exports = (sequelize, DataTypes) => {
  const UniversityDetail = sequelize.define(
    "UniversityDetail",
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      college_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      affiliated_university: { 
        type: DataTypes.STRING,
        allowNull: true, 
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      pincode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      website_link: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      about: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      profile_pic: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      university_logo_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
        authorization_letter_url: { 
        type: DataTypes.STRING,
        allowNull: true,
      },
      social_media_link: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email_id_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      aadhar_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      phone_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      school_college_id: {
        type: DataTypes.INTEGER,
        allowNull: true, //will do infuture falsee
        references: {
          model: "school_colleges",
          key: "id",
        },
        onDelete: "SET NULL",
      },

      // Verification status (admin-controlled)
      is_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false, // ← false until admin approves
      },
    },
    {
      tableName: "university_details",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  UniversityDetail.associate = function (models) {
    UniversityDetail.belongsTo(models.User, {
      foreignKey: 'user_id',
      onDelete: 'CASCADE'
    });

    UniversityDetail.belongsToMany(models.Course, {
      through: 'UniversityCourse',
      foreignKey: 'university_id',
      otherKey: 'course_id',
      as: 'courses'
    });


      //  link to canonical college
    UniversityDetail.belongsTo(models.SchoolCollege, {
      foreignKey: 'school_college_id',
      as: 'schoolCollege',
      onDelete: 'SET NULL'
    });
    
  };

  return UniversityDetail;
};
