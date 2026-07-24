const fs = require("fs");

const userModel = require("./user.model");

const { mailEvents } = require("../../services/mailer");
const { generateHash, compareHash } = require("../../utils/bcrypt");
const {
  generateOTP,
  signJWT,
  generateRandomToken,
} = require("../../utils/token");
const { generateRTDuration } = require("../../utils/date");
const { generatePassword } = require("../../utils/textUtils");

const changePassword = async (currentUser, payload) => {
  const { oldPassword, password } = payload;
  const user = await userModel.findOne({
    _id: currentUser,
    isEmailVerified: true,
    isBlocked: false,
  });
  if (!user) throw new Error("User not found");
  const isValidOldPassword = compareHash(user?.password, oldPassword);
  if (!isValidOldPassword) throw new Error("Password didn't match.");
  const newPassword = generateHash(password);
  const updatedUser = await userModel.updateOne(
    { _id: currentUser },
    { password: newPassword },
  );
  if (updatedUser.acknowledged) {
    mailEvents.emit(
      "sendEmail",
      user?.email,
      `Password changed Sucessfully`,
      `Your password has been changed sucessfully.`,
    );
  }
};

const list = async ({ page = 1, limit = 10, search }) => {
  const query = [];
  // Search / Filter
  if (search?.name) {
    query.push({
      $match: {
        name: new RegExp(search?.name, "gi"),
      },
    });
  }

  // Join Collection
  query.push({
    $project: {
      password: 0,
      refresh_token: 0,
      otp: 0,
    },
  });

  // Pagination

  query.push(
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [
          {
            $skip: (+page - 1) * +limit,
          },
          {
            $limit: +limit,
          },
        ],
      },
    },
    {
      $addFields: {
        total: {
          $arrayElemAt: ["$metadata.total", 0],
        },
      },
    },
    {
      $project: {
        metadata: 0,
      },
    },
  );

  const result = await userModel.aggregate(query, { allowDiskUse: true });

  return {
    users: result[0].data,
    total: result[0].total || 0,
    page: +page,
    limit: +limit,
  };
};

const login = async (payload) => {
  const { email, password } = payload;
  const user = await userModel.findOne({ email });
  if (!user) throw new Error(`User not found`);
  if (user?.isBlocked)
    throw new Error(`User Blocked, Please Contact the Admin.`);
  if (!user?.isEmailVerified) throw new Error(`Please Verify your Email.`);
  const isValidPassword = compareHash(user?.password, password);
  if (!isValidPassword) throw new Error(`Email or password didn't match.`);
  const data = {
    name: user?.name,
    email: user?.email,
  };
  const rt = generateRandomToken();
  const rt_duration = generateRTDuration();
  await userModel.updateOne(
    { email: user?.email },
    { refresh_token: { code: rt, duration: rt_duration } },
  );
  return {
    access_token: signJWT(data),
    refresh_token: rt,
    data: "User logged in Sucessfully. ",
  };
};

const register = async (payload) => {
  const { password, ...rest } = payload;
  const existingUser = await userModel.findOne({ email: rest?.email });
  if (existingUser) {
    fs.unlinkSync("public".concat(rest.picture));
    throw new Error(`Email is already in use`);
  }
  rest.password = generateHash(password);
  rest.otp = generateOTP();
  const newUser = await userModel.create(rest);
  if (newUser) {
    mailEvents.emit(
      "sendEmail",
      rest?.email,
      `Welcome to Buildme AI`,
      `Thank you for signing up. Please use this code ${rest.otp} to verify your email.`,
    );
  }
};

const verifyEmail = async (payload) => {
  const { email, otp } = payload;
  if (otp.length !== 6) throw new Error("OTP must be 6 digits");
  const user = await userModel.findOne({ email, isEmailVerified: false });
  if (!user) throw new Error("User not found");
  const isValidOTP = user.otp === String(otp);
  if (!isValidOTP) throw new Error("OTP is not Valid");
  const userUpdate = await userModel.updateOne(
    { email },
    { isEmailVerified: true, otp: "" },
  );
  if (userUpdate) {
    mailEvents.emit(
      "sendEmail",
      email,
      `Email Verified Sucessfully`,
      `Thank you for verifying your email.`,
    );
  }
};
const resendVerifyEmail = async (payload) => {
  const { email } = payload;
  const user = await userModel.findOne({ email, isEmailVerified: false });
  if (!user) throw new Error("User not found");
  const otp = generateOTP();
  const userUpdate = await userModel.updateOne({ email }, { otp });
  if (userUpdate) {
    mailEvents.emit(
      "sendEmail",
      email,
      `Here is your Verification Code`,
      `Your Email Verification Code is ${otp}.`,
    );
  }
};

const refreshToken = async (payload) => {
  const { refresh_token, email } = payload;
  const user = await userModel.findOne({
    email,
    isEmailVerified: true,
    isBlocked: false,
  });
  if (!user) throw new Error("User not Found");
  const { refresh_token: rt_in_db } = user;
  if (rt_in_db?.code !== refresh_token) throw new Error("Token mismatch");
  const currentTime = new Date();
  const databaseTime = new Date(rt_in_db.duration);
  if (currentTime > databaseTime) throw new Error("Token expired");
  const data = {
    name: user?.name,
    email: user?.email,
  };
  return { access_token: signJWT(data) };
};

const fpTokenGeneration = async ({ email }) => {
  const user = await userModel.findOne({
    email,
    isEmailVerified: true,
    isBlocked: false,
  });
  if (!user) throw new Error(`User not Found`);
  const fpToken = generateOTP();
  const updateUser = await userModel.updateOne({ email }, { otp: fpToken });
  if (updateUser.acknowledged) {
    mailEvents.emit(
      "sendEmail",
      email,
      `Recover your account`,
      `Here is your account recovery code ${fpToken}.`,
    );
  }
};
const fpTokenVerification = async (payload) => {
  const { email, token, password } = payload;
  const user = await userModel.findOne({
    email,
    isEmailVerified: true,
    isBlocked: false,
  });
  if (!user) throw new Error("User not found");
  const isValidToken = token === user?.otp;
  if (!isValidToken) throw new Error("Token mismatch");
  const newPassword = generateHash(password);
  const updatedUser = await userModel.updateOne(
    { email },
    { password: newPassword, otp: "" },
  );
  if (updatedUser.acknowledged) {
    mailEvents.emit(
      "sendEmail",
      email,
      `Password has been Updated`,
      `Your password has been updated Sucessfully.`,
    );
  }
};

const resetPassword = async ({ email }) => {
  const user = await userModel.findOne({
    email,
    isEmailVerified: true,
    isBlocked: false,
  });
  if (!user) throw new Error("User not found");
  const password = generatePassword();
  const newPassword = generateHash(password);
  const updatedUser = await userModel.updateOne(
    { email },
    { password: newPassword },
  );
  if (updatedUser.acknowledged) {
    mailEvents.emit(
      "sendEmail",
      email,
      `Password Reset Sucessfully`,
      `Your password has been changed sucessfully. Your new password is ${password}.`,
    );
  }
};

const getProfile = async (currentUser) =>
  userModel
    .findOne({ _id: currentUser })
    .select("-password -refresh_token  -otp -isBlocked");

const updateProfile = async (currentUser, payload) => {
  const user = await userModel.findOne({
    _id: currentUser,
    isEmailVerified: true,
    isBlocked: false,
  });
  if (!user) throw new Error("User not found");
  const newPayload = { name: payload?.name };
  const updatedUser = await userModel.findOneAndUpdate(
    { _id: currentUser },
    newPayload,
    { new: true },
  );
  return { name: updatedUser?.name };
};
const updateUser = async (currentUser, payload) => {
  const user = await userModel.findOne({
    _id: id,
  });
  if (!user) throw new Error("User not found");
  return userModel
    .findOneAndUpdate({ _id: id }, payload, { new: true })
    .select("-password -refresh_token -otp");
};

const addUser = async (payload) => {
  const { name, email, roles = [] } = payload;
  const existingUser = await userModel.findOne({ email });
  if (existingUser) throw new Error("Email is already in use");
  const randomPassword = generatePassword();
  const password = generateHash(randomPassword);
  const otp = generateOTP();
  const userRoles = roles.length === 0 ? ["user"] : roles;
  const userPayload = { name, email, roles: userRoles, password, otp };
  const newUser = await userModel.create(userPayload);
  if (newUser) {
    mailEvents.emit(
      "sendEmail",
      email,
      `Welcome to Buildme AI`,
      `Thank you for signing up. Please use this code ${otp} to verify your email.`,
    );
  }
  return { data: "User added Sucessfully" };
};

const getById = async (id) =>
  userModel.findOne({ _id: id }).select("-password -refresh_token -otp");

const blockUser = async (id) => {
  const user = await userModel.findOne({ _id: id });
  if (!user) throw new Error("User not found");
  const result = await userModel.updateOne(
    { _id: id },
    { isBlocked: !user?.isBlocked },
  );
  if (result.acknowledged) {
    return {
      data: `User ${!user?.isBlocked ? "blocked" : "unblocked"} sucessfully.`,
    };
  }
};

module.exports = {
  addUser,
  blockUser,
  changePassword,
  list,
  login,
  register,
  resendVerifyEmail,
  refreshToken,
  fpTokenGeneration,
  fpTokenVerification,
  resetPassword,
  getProfile,
  getById,
  updateProfile,
  updateUser,
  verifyEmail,
};
