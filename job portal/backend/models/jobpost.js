module.exports = (sequelize, DataTypes) => {
  const JobPost = sequelize.define(
    "JobPost",
    {
      job_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      company_recruiter_profile_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "company_recruiter_profiles",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      opportunity_type: DataTypes.STRING, //Internship, Job, Project
      job_role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "job_roles",
          key: "id",
        },
        onDelete: "RESTRICT",
      },
      post_type: {
        type: DataTypes.ENUM("active", "future", "college"),
        allowNull: true, // allows NULL
        defaultValue: null,
      },
      skill_required_note: DataTypes.STRING,
      job_type: DataTypes.STRING,
      job_time: DataTypes.STRING,
      days_in_office: DataTypes.INTEGER,

      //will remove this city id as not used
      city_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "FilterOptions",
          key: "id",
        },
        onDelete: "RESTRICT",
      },
      number_of_openings: DataTypes.INTEGER,
      job_description: DataTypes.TEXT,
      candidate_preferences: DataTypes.STRING,
      women_preferred: DataTypes.BOOLEAN,
      stipend_type: DataTypes.STRING,
      stipend_min: DataTypes.INTEGER,
      stipend_max: DataTypes.INTEGER,
      incentive_per_year: DataTypes.STRING,
      perks: {
        type: DataTypes.TEXT,
        get() {
          try {
            const rawValue = this.getDataValue("perks");
            if (!rawValue) return [];
            return typeof rawValue === "string"
              ? JSON.parse(rawValue.replace(/\\"/g, "'"))
              : rawValue;
          } catch (e) {
            console.error("Error parsing perks:", e);
            return [];
          }
        },
        set(value) {
          this.setDataValue("perks", JSON.stringify(value || []));
        },
      },
      screening_questions: {
        type: DataTypes.TEXT,
        get() {
          try {
            const rawValue = this.getDataValue("screening_questions");
            if (!rawValue) return [];
            return typeof rawValue === "string"
              ? JSON.parse(rawValue.replace(/\\"/g, "'"))
              : rawValue;
          } catch (e) {
            console.error("Error parsing screening_questions:", e);
            return [];
          }
        },
        set(value) {
          this.setDataValue("screening_questions", JSON.stringify(value || []));
        },
      },
      phone_contact: DataTypes.STRING,
      duration_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "filter_options",
          as: "duration_job_posts",
          key: "id",
        },
        onDelete: "RESTRICT",
      },
      internship_start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: "Official internship start date",
      },
      internship_from_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: "Custom range start date (if applicable)",
      },
      internship_to_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        defaultValue: null,
        comment: "Internship end date (optional for non-custom internships)",
      },
      is_custom_internship_date: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "Flag for custom date ranges",
      },
      project_start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      project_end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      alternate_phone_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      views: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      active_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1, // "0=draft, 1=active and hiring, 2=closed"
        //now changed as per payment 0=draft 1=active 2 2=inactive/closed 3 =unpaid
      },
      min_skill_match_required: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allnowNull: false,
      },

      // Payment related fields
      payment_type: {
        type: DataTypes.ENUM("subscription", "one_time", "free", "free_promo"),
        allowNull: true,
        defaultValue: "free",
      },
      subscription_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      purchase_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },

      //not to use as eligible colleges is already there... so collge_ids seems reduncdant will reove this
      college_ids: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null,
      },
      is_college_specific: {
        type: DataTypes.TINYINT(1),
        allowNull: true,
        defaultValue: 0,
      },

      //new experinece and education fieldss
      eligible_education_levels: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },
      eligible_specialization_ids: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },
      other_eligible_specializations: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },
      include_pursuing_students: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      experience_required: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      experience_min: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      experience_max: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      experience_types: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },
    },
    {
      tableName: "job_posts",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { fields: ["payment_type"] },
        { fields: ["subscription_id"] },
        { fields: ["purchase_id"] },
      ],
    }
  );

  JobPost.associate = function (models) {
    // Existing associations
    JobPost.belongsTo(models.CompanyRecruiterProfile, {
      foreignKey: "company_recruiter_profile_id",
    });
    JobPost.belongsTo(models.JobRole, {
      foreignKey: "job_role_id",
    });
    JobPost.hasMany(models.Application, { foreignKey: "job_post_id" });
    JobPost.belongsTo(models.FilterOption, {
      foreignKey: "duration_id",
      // as: 'duration_job_posts'
    });

    // Many-to-Many through junction tables
    // JobPost model
    JobPost.belongsToMany(models.Course, {
      through: models.JobPostCourse,
      foreignKey: "job_post_id",
      otherKey: "course_id",
      as: "eligibleCourses",
      onDelete: "CASCADE",
    });

    JobPost.belongsToMany(models.SchoolCollege, {
      through: models.JobPostCollege,
      foreignKey: "job_post_id",
      otherKey: "college_id",
      as: "eligibleColleges",
      onDelete: "CASCADE",
    });

    JobPost.belongsToMany(models.Location, {
      through: models.JobPostCity,
      foreignKey: "job_post_id",
      otherKey: "city_id",
      as: "eligibleCities",
      onDelete: "CASCADE",
    });

    JobPost.belongsToMany(models.Skill, {
      through: models.JobPostSkill,
      foreignKey: "job_post_id",
      otherKey: "skill_id",
      as: "skills",
      onDelete: "CASCADE",
    });

    JobPost.belongsTo(models.OneTimePurchase, {
      foreignKey: "purchase_id",
      as: "oneTimePurchase",
    });

    JobPost.hasOne(models.PaymentOrder, {
      foreignKey: "job_id",
      as: "paymentOrder",
    });


    JobPost.belongsToMany(models.Skill, {
      through: {
        model: models.JobPostSkill,
        scope: { type: "must_have" }, // default scope
      },
      foreignKey: "job_post_id",
      otherKey: "skill_id",
      as: "mustHaveSkills",
      onDelete: "CASCADE",
    });

    JobPost.belongsToMany(models.Skill, {
      through: {
        model: models.JobPostSkill,
        scope: { type: "preferred" },
      },
      foreignKey: "job_post_id",
      otherKey: "skill_id",
      as: "preferredSkills",
      onDelete: "CASCADE",
    });

  };

  return JobPost;
};
