// models/ContactUnlock.js
module.exports = (sequelize, DataTypes) => {
  const ContactUnlock = sequelize.define(
    "ContactUnlock",
    {
      unlock_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      university_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "university_details",
          key: "id", 
        },
        onDelete: "CASCADE",
      },
      recruiter_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      job_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "job_posts",
          key: "job_id",
        },
        onDelete: "SET NULL",
      },
      batch_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "university_credit_batches",
          key: "batch_id",
        },
        onDelete: "SET NULL",
      },
    },
    {
      tableName: "contact_unlocks",
      timestamps: true,
      createdAt: "unlocked_at",
      updatedAt: false,
      indexes: [
        {
          name: "unique_university_recruiter",
          unique: true,
          fields: ["university_id", "recruiter_user_id"],
        },
        { fields: ["university_id"] },
      ],
    }
  );

  ContactUnlock.associate = function (models) {
    ContactUnlock.belongsTo(models.UniversityDetail, {
      foreignKey: "university_id",
      targetKey: "id", 
      as: "university",
    });

    ContactUnlock.belongsTo(models.User, {
      foreignKey: "recruiter_user_id",
      as: "recruiter",
    });

    ContactUnlock.belongsTo(models.JobPost, {
      foreignKey: "job_id",
      as: "job",
      allowNull: true,
    });

    ContactUnlock.belongsTo(models.UniversityCreditBatch, {
      foreignKey: "batch_id",
      as: "batch",
      allowNull: true,
    });
  };

  return ContactUnlock;
};
