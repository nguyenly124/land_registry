const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Otp', {
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true
    },
    otp: {
      type: DataTypes.CHAR(6),
      allowNull: false
    },
    expires: {
      type: DataTypes.DATE,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.fn('now')
    }
  }, {
    sequelize,
    tableName: 'otps',
    schema: 'public',
    timestamps: false,
    freezeTableName: true,
    indexes: [
      {
        name: "idx_otps_expires",
        fields: [
          { name: "expires" },
        ]
      },
      {
        name: "otps_pkey",
        unique: true,
        fields: [
          { name: "email" },
        ]
      },
    ]
  });
};
