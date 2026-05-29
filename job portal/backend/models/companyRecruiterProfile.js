module.exports = (sequelize, DataTypes) => {
  const CompanyRecruiterProfile = sequelize.define(
    "CompanyRecruiterProfile",
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        // unique: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      designation_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "job_roles",
          key: "id",
        },
        onDelete: "SET NULL",
      },
      company_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      industry_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "industries",
          key: "id",
        },
        onDelete: "SET NULL",
      },
      company_location_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "locations",
          key: "id",
        },
        onDelete: "SET NULL",
        comment: "Foreign Key to locations table (stores City ID only)"
      },
      // ===== ADDRESS FIELDS =====
      address_line_1: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "Primary address line (street, building, area)"
      },
      address_line_2: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "Secondary address line (landmark, locality, etc.)"
      },
      state: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "State/Province name"
      },
      country: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "Country name"
      },
      pincode: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: "Postal/ZIP code (stored as string to preserve leading zeros)"
      },
      // ===== END ADDRESS FIELDS =====
      about: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      logo_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      gst_number: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      company_address: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      hiring_preferences: {
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
      is_gst_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      profile_pic: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email_alert_frequency: {
        type: DataTypes.ENUM("off", "daily", "weekly", "monthly"),
        defaultValue: "off",
        allowNull: false,
      },
      last_alert_sent_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      razorpay_customer_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: null,
        comment: "Razorpay customer ID for subscriptions",
      },
       // NEW FIELDS ADDED
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0, 
        comment: '0:Seed, 1:Active, 2:Blocked, 3:Student-Pending'
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'false:Pending Review, true:Admin Approved'
      }
    },
    {
      tableName: "company_recruiter_profiles",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  CompanyRecruiterProfile.associate = function (models) {
    CompanyRecruiterProfile.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
      getterMethods: {
        recruiter_name() {
          return this.user
            ? `${this.user.first_name} ${this.user.last_name}`.trim()
            : null;
        },
        recruiter_email() {
          return this.user ? this.user.email : null;
        },
        recruiter_phone() {
          return this.user ? this.user.phone : null;
        },
      },
    });

    CompanyRecruiterProfile.belongsTo(models.JobRole, {
      foreignKey: "designation_id",
      as: "designation",
      onDelete: "SET NULL",
    });

    CompanyRecruiterProfile.hasMany(models.JobPost, {
      foreignKey: "company_recruiter_profile_id",
      as: "jobPosts",
      onDelete: "CASCADE",
    });

    CompanyRecruiterProfile.hasMany(models.Experience, {
      foreignKey: "company_recruiter_profile_id",
      as: "experiences",
      onDelete: "CASCADE",
    });

    CompanyRecruiterProfile.belongsTo(models.Industry, {
      foreignKey: "industry_id",
      as: "industry",
      onDelete: "SET NULL",
    });

    CompanyRecruiterProfile.belongsToMany(models.Language, {
      through: "company_languages",
      as: "languages",
      foreignKey: "company_recruiter_profile_id",
      otherKey: "language_id",
    });

    CompanyRecruiterProfile.belongsTo(models.Location, {
      foreignKey: "company_location_id",
      as: "companyLocation",
      onDelete: "SET NULL",
    });

    //not used now now user skills refers to authority
    // CompanyRecruiterProfile.hasMany(models.UserSkill, {
    //   foreignKey: "authority_id",
    //   as: "userSkills",
    //   onDelete: "CASCADE",
    // });


    CompanyRecruiterProfile.hasMany(models.CompanySubscription, {
      foreignKey: "company_id",
      as: "subscriptions",
    });

    CompanyRecruiterProfile.hasMany(models.PaymentOrder, {
      foreignKey: "company_id",
      as: "payments",
    });
  };

  return CompanyRecruiterProfile;
};
