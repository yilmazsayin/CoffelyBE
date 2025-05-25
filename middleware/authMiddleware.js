const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res
      .status(401)
      .json({ code: 401, success: false, message: "Yetkisiz erişim!" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .json({
          code: 403,
          success: false,
          message: "Geçersiz veya süresi dolmuş token.",
        });
    }

    req.userId = decoded.id;
    next();
  });
};

module.exports = authMiddleware;
