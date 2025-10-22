const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('LandParcel', {
    parcel_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    parcel_code: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: "uq_parcel_code"
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    area: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    owner_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Account',
        key: 'account_id'
      }
    }
  }, {
    sequelize,
    tableName: 'LandParcel',
    schema: 'public',
    timestamps: false,
    freezeTableName: true,
    indexes: [
      {
        name: "LandParcel_pkey",
        unique: true,
        fields: [
          { name: "parcel_id" },
        ]
      },
      {
        name: "uq_parcel_code",
        unique: true,
        fields: [
          { name: "parcel_code" },
        ]
      },
    ]
  });
};
