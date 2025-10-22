const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

// Tải biến môi trường từ file .env
dotenv.config();

// Sử dụng chuỗi kết nối từ biến môi trường
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false 
});

// Kiểm tra kết nối
async function connectToDatabase() {
  try {
    await sequelize.authenticate();
    console.log("Kết nối thành công đến PostgreSQL bằng Sequelize.");
  } catch (error) {
    console.error("Lỗi kết nối đến PostgreSQL:", error.message);
  }
}

connectToDatabase();

module.exports = { sequelize };