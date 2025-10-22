const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('HoSoDocument', {
    doc_id: {
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
    doc_name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    file_path: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    uploaded_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'HoSoDocument',
    schema: 'public',
    timestamps: false,
    freezeTableName: true,
    indexes: [
      {
        name: "HoSoDocument_pkey",
        unique: true,
        fields: [
          { name: "doc_id" },
        ]
      },
    ]
  });
};
