//chuẩn hóa cấu trúc JSON trả về cho client, đảm bảo tính đồng bộ
const sendResponse = (res, status, success, message, data = null, errors = null) => {
  const response = { success, message };
  if (data) response.data = data;
  if (errors) response.errors = errors;
  return res.status(status).json(response);
};

module.exports = { sendResponse };