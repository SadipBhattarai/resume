const Joi = require("joi");
const userModel = require("./user.model");

const userSchema = Joi.object({
  name: Joi.string().min(3).max(50).allow(""),
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,30}$/)
    .message("Password failed to meet the requirement."),
  roles: Joi.array().items(Joi.string().valid("admin", "user")),
  picture: Joi.string(),
});

const userValidationMw = async (req, resizeBy, next) => {
  try {
    await userSchema.validateAsync(req.body);
    if (req.body.email) {
      const user = await userModel.findOne({ email: req.body.email });
      if (user) throw new Error("Email validation is already in use.");
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { userValidationMw };
