const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Account', {
    account_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: "Account_username_key"
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    role: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    },
    password_last_changed: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    password_expiration_days: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 30
    },
    failed_attempts: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    lock_until: {
      type: DataTypes.DATE,
      allowNull: true
    },
    reset_token: {
      type: DataTypes.STRING(6),
      allowNull: true
    },
    reset_expires: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Account',
    schema: 'public',
    timestamps: false,
    freezeTableName: true,
    indexes: [
      {
        name: "Account_pkey",
        unique: true,
        fields: [
          { name: "account_id" },
        ]
      },
      {
        name: "Account_username_key",
        unique: true,
        fields: [
          { name: "username" },
        ]
      },
    ]
  });
};
