const { verifyToken } = require("../utils/jwt");

const authentication = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res
        .status(401)
        .send({ error: "Access denied. No token provided." });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .send({ error: "Access denied. No token provided." });
    }
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).send({ error: "Access denied. Invalid token." });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.log("🚀 ~ authentication ~ error:", error, "path: ", req.originalUrl, "method: ", req.method);
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .send({ error: "Access denied. Token has expired." });
    }
    return res.status(401).send({ error: "Access denied. Invalid token." });
  }
};

module.exports = authentication;
