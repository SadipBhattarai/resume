const bcryptjs = require("bcryptjs");

const generateHash = (password) =>
  bcryptjs.hashSync(password, +process.env.SALT_ROUND);
const compareHash = (hashPassword, password) =>
  bcryptjs.compareSync(password, hashPassword);

module.exports = { generateHash, compareHash };
