const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Notification', {
    notification_id: {
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
    message: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'Notification',
    schema: 'public',
    timestamps: false,
    freezeTableName: true,
    indexes: [
      {
        name: "Notification_pkey",
        unique: true,
        fields: [
          { name: "notification_id" },
        ]
      },
    ]
  });
};
