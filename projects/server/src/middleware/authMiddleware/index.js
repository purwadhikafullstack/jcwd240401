const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET_KEY;

module.exports = {
  async verifyToken(req, res, next) {
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(401).send({
        message: "Token not found",
      });
    }

    const [format, token] = authorization.split(" ");
    if (format.toLocaleLowerCase() === "bearer") {
      try {
        const payload = jwt.verify(token, secretKey);
        if (!payload) {
          return res.status(401).send({
            message: "Token verification failed",
          });
        }
        req.user = payload;
        next();
      } catch (error) {
        return res.status(401).send({
          message: "invalid token",
          error: error.message,
        });
      }
    }
  },
  async verifySuperAdmin(req, res, next) {
    if (req.user.role === "1") {
      return next();
    }
    return res.status(401).send({
      message: "You are not allowed to access this content",
    });
  },
  async verifyAdmin(req, res, next) {
    if (req.user.role === "2") {
      return next();
    }
    return res.status(401).send({
      message: "You are not allowed to access this content",
    });
  },
  async verifyUser(req, res, next) {
    if (req.user.role === "3") {
      return next();
    }
    return res.status(401).send({
      message: "You are not allowed to access this content",
    });
  },
  async verifyIsAdmin(req, res, next) {
    if (req.user.role === "1" || req.user.role === "2") {
      return next();
    }
    return res.status(401).send({
      message: "You are not allowed to access this content",
    });
  },
};
