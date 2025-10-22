const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('UsersSync', {
    raw_json: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    id: {
      type: DataTypes.TEXT,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'users_sync',
    schema: 'neon_auth',
    timestamps: false,
    freezeTableName: true,
    indexes: [
      {
        name: "users_sync_deleted_at_idx",
        fields: [
          { name: "deleted_at" },
        ]
      },
      {
        name: "users_sync_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
