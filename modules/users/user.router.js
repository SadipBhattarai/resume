const router = require("express").Router();
const userController = require("../users/user.controller");
router.post("/login", async (req, res, next) => {
  try {
    const result = await userController.login(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});
router.post("/register", async (req, res, next) => {
  try {
    const result = await userController.register(req.body);
    res.json({ data: `User Registered Sucessfully` });
  } catch (error) {
    next(error);
  }
});
router.post("/email/verify", async (req, res, next) => {
  try {
    const result = await userController.verifyEmail(req.body);
    res.json({ data: `Email Verified Sucessfully` });
  } catch (error) {
    next(error);
  }
});
router.post("/email/resend", async (req, res, next) => {
  try {
    const result = await userController.resendVerifyEmail(req.body);
    res.json({ data: `OTP resent Sucessfully` });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
