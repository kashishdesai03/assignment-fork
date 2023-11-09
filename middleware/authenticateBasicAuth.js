const sequelize = require("../db/connection");
const bcrypt = require("bcrypt");
const User = require("../models/User");

async function basicAuth(req, res, next) {
  console.log("req.headers.authorization " + req.headers.authorization);

  console.log("1 " + req.headers);

  if (
    !req.headers.authorization ||
    req.headers.authorization.indexOf("Basic ") === -1
  ) {
    return res
      .status(401)
      .json({ message: "Missing Authorization Header" })
      .send();
  }

  const base64Credentials = req.headers.authorization.split(" ")[1];

  console.log("base64Credentials " + base64Credentials);

  const credentials = Buffer.from(base64Credentials, "base64").toString(
    "ascii"
  );

  const [email, password] = credentials.split(":");
  console.log("email: " + email);
  console.log("password: " + password);

  // console.log("email" + email);

  const user = await User.findOne({ where: { email: email } });

  console.log(user);

  const result = await bcrypt.compareSync(password, user.password);

  if (!result) {
    return res
      .status(401)
      .json({ message: "Invalid Authentication Credentials" })
      .send();
  }

  req.user = user;

  next();
}

module.exports = basicAuth;
