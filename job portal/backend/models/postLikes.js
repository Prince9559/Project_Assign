module.exports = (sequelize, DataTypes) => {
    const PostLikes = sequelize.define('PostLikes', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        post_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
        }
    }, {
        timestamps:false,
        // timestamps: true,
        // createdAt: "created_at",
        tableName: 'post_likes'
    });

    return PostLikes;
};
