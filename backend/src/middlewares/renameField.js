module.exports = (req, res, next) => {
  if (req.files && req.files.length > 0) {
    req.files[0].fieldname = 'image'; // ÉP THÀNH "avata"
  }
  next();
};