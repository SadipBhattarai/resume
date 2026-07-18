const bcryptjs = require("bcryptjs");

const generateHash = (password) =>
  bcryptjs.hashSync(password, +process.env.SALT_ROUND);
const compareHash = (password, hashPassword) => {
  bcryptjs.hash();
};

module.exports = {generateHash, compareHash}