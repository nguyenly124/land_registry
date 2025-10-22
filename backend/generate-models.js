// Tải thư viện
require('dotenv').config();
const SequelizeAuto = require('sequelize-auto');

// Đọc biến môi trường từ .env
const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASS,
  DB_NAME,
  DB_DIALECT,
  DB_SSL
} = process.env;

// Thư mục lưu models
const outputDir = './src/models';

// Cấu hình SSL cho Neon (rất quan trọng)
const dialectOptions = DB_SSL === 'true'
  ? {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    }
  : {};

// Khởi tạo SequelizeAuto
const auto = new SequelizeAuto(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT || 5432,
  dialect: DB_DIALECT || 'postgres',
  directory: outputDir,
  caseModel: 'p',     // PascalCase cho tên model
  caseFile: 'c',      // camelCase cho tên file
  singularize: true,
  additional: {
    timestamps: false,
    freezeTableName: true,
  },
  dialectOptions,
});

// Chạy auto generate
auto.run()
  .then(data => {
    console.log(' Models generated successfully!');
    console.log(' Tables:', Object.keys(data.tables));
  })
  .catch(err => {
    console.error(' Error generating models:', err);
  });
