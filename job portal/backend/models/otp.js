const bcrypt = require('bcryptjs');
const SALT_ROUNDS = 10;

module.exports = (sequelize, DataTypes) => {
  const OTP = sequelize.define('OTP', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    otp: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    purpose: {
      type: DataTypes.ENUM(
        'email_verification',
        'phone_verification',
        'password_reset',
        'job_application',
        'document_verification',
        'aadhaar_verification'
      ),
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expires_at',
      defaultValue: () => new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    },
    is_used: {
      type: DataTypes.BOOLEAN,
      field: 'is_used',
      defaultValue: false,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      field: 'is_verified',
      defaultValue: false,
    },
    verification_attempts: {
      type: DataTypes.INTEGER,
      field: 'verification_attempts',
      defaultValue: 0,
    },
  }, {
    tableName: 'otps',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['user_id', 'purpose', 'is_used', 'expires_at'],
        name: 'otp_verification_index',
      },
    ],
  });

  // Hash OTP before saving
  OTP.beforeSave(async (otp) => {
    if (otp.changed('otp')) {
      otp.otp = await bcrypt.hash(otp.otp, SALT_ROUNDS);
    }
  });

  // Verify OTP
  OTP.prototype.verifyOTP = async function (plainTextOTP) {
    return bcrypt.compare(plainTextOTP, this.otp);
  };

  // Check if expired
  OTP.prototype.isExpired = function () {
    return this.expires_at < new Date();
  };

  // Check if valid
  OTP.prototype.isValid = function () {
    return !this.isExpired() && !this.is_used && this.verification_attempts < 3;
  };

  // Mark as used
  OTP.prototype.markAsUsed = async function () {
    this.is_used = true;
    this.is_verified = true;
    return this.save();
  };

  // Increment attempts
  OTP.prototype.incrementAttempts = async function () {
    this.verification_attempts += 1;
    if (this.verification_attempts >= 3) {
      this.is_used = true;
    }
    return this.save();
  };

  // Static method to generate OTP
  OTP.generateOTP = function () {
    return Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
  };

  // Cleanup expired OTPs
  OTP.cleanupExpiredOTPs = async function () {
    try {
      const [results, metadata] = await sequelize.query(`
        DELETE FROM otps 
        WHERE expires_at < NOW() 
        OR (is_used = true AND expires_at < DATE_SUB(NOW(), INTERVAL 1 DAY))
      `);
      return metadata.affectedRows || 0;
    } catch (error) {
      console.error('Error cleaning up expired OTPs:', error);
      throw error;
    }
  };

  // Schedule cleanup job
  OTP.setupCleanupJob = function (intervalMinutes = 60) {
    if (OTP.cleanupInterval) {
      clearInterval(OTP.cleanupInterval);
    }

    OTP.cleanupInterval = setInterval(async () => {
      try {
        const deletedCount = await OTP.cleanupExpiredOTPs();
        console.log(`[${new Date().toISOString()}] Cleaned up ${deletedCount} expired OTPs`);
      } catch (error) {
        console.error('Error in OTP cleanup job:', error);
      }
    }, intervalMinutes * 60 * 1000);

    OTP.cleanupExpiredOTPs().catch(console.error);
  };

  OTP.associate = function (models) {
    OTP.belongsTo(models.User, {
      foreignKey: 'user_id',
      targetKey: 'id',
      as: 'user',
      onDelete: 'CASCADE',
    });
  };

  return OTP;
};
