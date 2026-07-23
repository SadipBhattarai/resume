const generatePassword = (length = 12) => {
  if (length < 8) {
    throw new Error(
      `Password length should be at least 8 characters for security.`,
    );
  }
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";

  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters[randomIndex];
  }

  return password;
};

module.exports = { generatePassword };
