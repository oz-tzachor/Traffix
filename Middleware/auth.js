const jwt = require("jsonwebtoken");
const secret = process.env.SECRET;

function createToken(user) {
  return jwt.sign({ user }, secret);
}

function verifyToken(token) {
  try {
    return jwt.verify(token, secret);
  } catch (e) {
    return e;
  }
}

function auth(req, res, next) {
  let token = req.headers.authorization.substring(
    7,
    req.headers.authorization.length
  );
  try {
    let userFromToken = jwt.verify(token, secret);
    req.user = userFromToken.user;
    next();
  } catch (e) {
    res.status(403).send(e);
    console.log("e", e);
  }
}

module.exports = { createToken, verifyToken, auth };
