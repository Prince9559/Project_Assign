// File Path: /server/models/MessageAttachment.js

module.exports = (sequelize, DataTypes) => {
const MessageAttachment = sequelize.define('MessageAttachment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  message_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'messages',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  file_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  file_path: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  file_type: {
    type: DataTypes.STRING(100),
    allowNull: false
    // e.g., 'image/png', 'application/pdf', 'image/jpeg'
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: false
    // Size in bytes
  },
  uploaded_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'message_attachments',
  timestamps: false,
  indexes: [
    {
      fields: ['message_id']
    }
  ]
});

MessageAttachment.associate = (models) => {
  MessageAttachment.belongsTo(models.Message, {
  foreignKey: 'message_id',
  as: 'message'
});
}


return MessageAttachment;
}