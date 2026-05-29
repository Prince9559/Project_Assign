// File Path: /models/Message.js
module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define(
    "Message",
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
      sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      sender_type: {
        type: DataTypes.ENUM("STUDENT", "COMPANY", "UNIVERSITY"),
        allowNull: false,
      },
      message_type: {
        type: DataTypes.ENUM(
          "text",
          "image",
          "document",
          "assignment",
          "interview_invite",
          "system"
        ),
        allowNull: false,
        defaultValue: "text",
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null,
        // Structure: { fileName, fileSize, fileType, filePath, assignmentId, interviewId, etc }
      },
      is_deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_edited: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "messages",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          fields: ["conversation_id", "created_at"],
        },
        {
          fields: ["sender_id"],
        },
      ],
    }
  );

  Message.associate = (models) => {
    // Message belongs to Conversation
    Message.belongsTo(models.Conversation, {
      foreignKey: "conversation_id",
      as: "conversation",
    });

    Message.hasMany(models.MessageAttachment, {
      foreignKey: "message_id",
      as: "attachments",
    });

    Message.belongsTo(models.User, {
      foreignKey: "sender_id",
      as: "sender",
    });
  };

  return Message;
};
