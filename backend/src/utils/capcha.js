// utils/captcha.js
const axiosClient = require("axios");

const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;

exports.verifyCaptcha = async (token) => {
  try {
    const response = await axiosClient.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: RECAPTCHA_SECRET,
          response: token,
        },
      }
    );
    return response.data.success;
  } catch (error) {
    console.error("Lỗi xác minh CAPTCHA:", error);
    return false;
  }
};