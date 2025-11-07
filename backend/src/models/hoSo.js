const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('HoSo', {
    hoso_id: {
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
      }
    },
    parcel_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'LandParcel',
        key: 'parcel_id'
      }
    },
    type: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "Chờ xử lý"
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    receiver_info: {
      type: DataTypes.JSONB,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'HoSo',
    schema: 'public',
    timestamps: false,
    freezeTableName: true,
    indexes: [
      {
        name: "HoSo_pkey",
        unique: true,
        fields: [
          { name: "hoso_id" },
        ]
      },
      {
        name: "idx_hoso_receiver_info",
        fields: [
          { name: "receiver_info" },
        ]
      },
      {
        name: "idx_hoso_type",
        fields: [
          { name: "type" },
        ]
      },
    ]
  });
};
