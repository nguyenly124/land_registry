// src/config/db.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

class Database {
  constructor() {
    this.sequelize = null;
    this.dbUrl = null; // Lưu dbUrl để dùng lại
    this.maxRetries = 5;
    this.retryDelay = 5000;
    this.init();
  }

  init() {
    this.dbUrl = process.env.DATABASE_URL?.trim();

    if (!this.dbUrl) {
      throw new Error('DATABASE_URL không được cấu hình trong .env');
    }

    this.sequelize = new Sequelize(this.dbUrl, {
      dialect: 'postgres',
      protocol: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      dialectOptions: this.getDialectOptions(),
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      define: {
        timestamps: false,
        freezeTableName: true
      }
    });
  }

  getDialectOptions() {
    const isProduction = process.env.NODE_ENV === 'production';
    const hasSSL = this.dbUrl?.includes('sslmode=require') || this.dbUrl?.includes('ssl=true');

    if (isProduction || hasSSL) {
      return {
        ssl: {
          require: true,
          rejectUnauthorized: false // Cho Render, Railway, Heroku
        }
      };
    }
    return {};
  }

  async connectWithRetry(attempt = 1) {
    try {
      await this.sequelize.authenticate();
      console.log('Kết nối database thành công!');
      return this.sequelize;
    } catch (error) {
      if (attempt <= this.maxRetries) {
        console.warn(`Lần ${attempt}/${this.maxRetries}: Không thể kết nối DB. Thử lại sau ${this.retryDelay / 1000}s...`);
        console.error('Lỗi:', error.message);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.connectWithRetry(attempt + 1);
      } else {
        console.error('Hết số lần thử. Không thể kết nối đến database.');
        throw error;
      }
    }
  }

  async syncModels() {
    try {
      await this.sequelize.sync({ alter: false });
      console.log('Đồng bộ models thành công.');
    } catch (error) {
      console.error('Lỗi khi đồng bộ models:', error);
    }
  }
}

// Export instance duy nhất
const db = new Database();

module.exports = {
  sequelize: db.sequelize,
  connectToDatabase: () => db.connectWithRetry(),
  syncModels: () => db.syncModels()
};