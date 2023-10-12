const sequelize = require("../db/connection");
const bcrypt = require("bcrypt");
const User = require("../models/User");

async function basicAuth(req, res, next) {
  let user; // Define the user variable here

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

  try {
    const user = await User.findOne({ where: { email: email } });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid Authentication Credentials" })
        .send();
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Invalid Authentication Credentials" })
        .send();
    }

    req.user = user; // Attach the user object to req.user
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" }).send();
  }
}

module.exports = basicAuth;
