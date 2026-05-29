// File Path: /models/Conversation.js


module.exports= (sequelize,DataTypes)=> {
    const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('job_application', 'general_inquiry', 'interview', 'assignment'),
    allowNull: false,
    defaultValue: 'job_application'
  },
  job_application_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'applications', 
      key: 'id'
    }
  },
  last_message_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_archived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'conversations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['last_message_at']
    },
    {
      fields: ['job_application_id']
    }
  ]
})

    Conversation.associate = (models) => {
      // A Conversation has many Participants
      Conversation.hasMany(models.ConversationParticipant, {
        foreignKey: "conversation_id",
        as: "participants",
      });

      // Conversation <-> Messages (One to Many)
      Conversation.hasMany(models.Message, {
        foreignKey: "conversation_id",
        as: "messages",
      });

      // Inside Conversation model file
      Conversation.belongsTo(models.Application, {
        foreignKey: "job_application_id",
        as: "application",
      });
    };
    return Conversation;
};
