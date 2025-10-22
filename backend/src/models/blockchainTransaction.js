const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('BlockchainTransaction', {
    transaction_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    hoso_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'HoSo',
        key: 'hoso_id'
      }
    },
    hash_value: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'BlockchainTransaction',
    schema: 'public',
    timestamps: false,
    freezeTableName: true,
    indexes: [
      {
        name: "BlockchainTransaction_pkey",
        unique: true,
        fields: [
          { name: "transaction_id" },
        ]
      },
    ]
  });
};
