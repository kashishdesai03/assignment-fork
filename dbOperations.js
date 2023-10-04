const User = require("./models/User");

async function findUserByEmail(emailId) {
  try {
    const user = await User.findOne({ where: { email: emailId } });
    return user;
  } catch (error) {
    throw error;
  }
}

module.exports = findUserByEmail;
// Other database operations can be added here
