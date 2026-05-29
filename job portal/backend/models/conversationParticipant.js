// File Path: /models/ConversationParticipant.js

module.exports = (sequelize, DataTypes) => {
  const ConversationParticipant = sequelize.define(
    "ConversationParticipant",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      conversation_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "conversations",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users", // Your existing users table
          key: "id",
        },
      },
      user_type: {
        type: DataTypes.ENUM("STUDENT", "COMPANY", "UNIVERSITY"),
        allowNull: false,
      },
      last_read_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      joined_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "conversation_participants",
      timestamps: false,
      indexes: [
        {
          fields: ["conversation_id"],
        },
        {
          fields: ["user_id"],
        },
        {
          unique: true,
          fields: ["conversation_id", "user_id"],
        },
      ],
    }
  );
  ConversationParticipant.associate = (models) => {
    // A ConversationParticipant belongs to a Conversation
    ConversationParticipant.belongsTo(models.Conversation, {
      foreignKey: "conversation_id",
      as: "conversation",
    });

    ConversationParticipant.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });
  };
  return ConversationParticipant;
};
