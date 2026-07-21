const router = require("express").Router();
const userController = require("../users/user.controller");
const { secureAPI } = require("../../utils/secure");
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
    await userController.register(req.body);
    res.json({ data: `User Registered Sucessfully` });
  } catch (error) {
    next(error);
  }
});
router.post("/email/verify", async (req, res, next) => {
  try {
    await userController.verifyEmail(req.body);
    res.json({ data: `Email Verified Sucessfully` });
  } catch (error) {
    next(error);
  }
});
router.post("/email/resend", async (req, res, next) => {
  try {
    await userController.resendVerifyEmail(req.body);
    res.json({ data: `OTP resent Sucessfully` });
  } catch (error) {
    next(error);
  }
});

router.post("/refresh", async (req, res, next) => {
  try {
    const result = await userController.refreshToken(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/", secureAPI, async (req, res, next) => {
  try {
    res.json({
      data: "I am admin route, and I need at least access token to access",
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/block", secureAPI(["admin"]), async(req, res, next) => {
  try {
    res.json({ data: "I am admin route" });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
