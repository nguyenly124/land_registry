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
    },
    land_type: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    certificate_number: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    certificate_issue_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    registration_status: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    latitude: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    longitude: {
      type: DataTypes.DECIMAL,
      allowNull: true
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
