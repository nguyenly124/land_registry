const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('UserProfile', {
    profile_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    account_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Account',
        key: 'account_id'
      },
      unique: "userprofiles_account_unique"
    },
    full_name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: "uq_phone"
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: "uq_email"
    },
    position: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    agency: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    staff_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: "uq_staff_code"
    },
    cccd: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: "uq_cccd"
    },
    avatar_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'UserProfile',
    schema: 'public',
    timestamps: false,
    freezeTableName: true,
    indexes: [
      {
        name: "UserProfile_pkey",
        unique: true,
        fields: [
          { name: "profile_id" },
        ]
      },
      {
        name: "uq_cccd",
        unique: true,
        fields: [
          { name: "cccd" },
        ]
      },
      {
        name: "uq_email",
        unique: true,
        fields: [
          { name: "email" },
        ]
      },
      {
        name: "uq_phone",
        unique: true,
        fields: [
          { name: "phone" },
        ]
      },
      {
        name: "uq_staff_code",
        unique: true,
        fields: [
          { name: "staff_code" },
        ]
      },
      {
        name: "userprofiles_account_unique",
        unique: true,
        fields: [
          { name: "account_id" },
        ]
      },
    ]
  });
};
