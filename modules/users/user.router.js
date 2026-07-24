const router = require("express").Router();
const userController = require("../users/user.controller");
const { secureAPI } = require("../../utils/secure");
const { storage, upload } = require("../../utils/multer");
const { userValidationMw } = require("./user.validation");

const newUpload = upload(storage());

router.post("/login", async (req, res, next) => {
  try {
    const result = await userController.login(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});
router.post(
  "/register",
  newUpload.single("picture"),
  userValidationMw,
  async (req, res, next) => {
    try {
      if (req.file) {
        req.body.picture = req.file.path.replace("public", "");
      }
      await userController.register(req.body);
      res.json({ data: `User Registered Sucessfully` });
    } catch (error) {
      next(error);
    }
  },
);
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
router.post("/forget-password", async (req, res, next) => {
  try {
    await userController.fpTokenGeneration(req.body);
    res.json({
      data: `An email has been sent to your mail address Sucessfully.`,
    });
  } catch (error) {
    next(error);
  }
});
router.post("/forget-password/verify", async (req, res, next) => {
  try {
    await userController.fpTokenVerification(req.body);
    res.json({ data: `Changed password sucessfully.` });
  } catch (error) {
    next(error);
  }
});

// List all users
// Add user
// Get one user
// Block user
// Update User
// Reset Password

// Profile
// Profile update

router.post("/reset-password", secureAPI(["admin"]), async (req, res, next) => {
  try {
    await userController.resetPassword(req.body);
    res.json({
      data: "Password reset Sucessfully.",
    });
  } catch (error) {
    next(error);
  }
});

router.get("/profile", secureAPI(["admin", "user"]), async (req, res, next) => {
  try {
    const result = await userController.getProfile(req.currentUser);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});
router.put("/profile", secureAPI(["admin", "user"]), async (req, res, next) => {
  try {
    const result = await userController.updateProfile(
      req.currentUser,
      req.body,
    );
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});
// ADMIN SECTION //

router.get("/", secureAPI(["admin"]), async (req, res, next) => {
  try {
    const { page, limit, name } = req.query;
    const search = { name };
    const result = await userController.list({ page, limit, search });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/", secureAPI(["admin"]), async (req, res, next) => {
  try {
    const result = await userController.addUser(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});
router.get("/:id", secureAPI(["admin"]), async (req, res, next) => {
  try {
    const result = await userController.getById(req.params.id);
    res.json({ result });
  } catch (error) {
    next(error);
  }
});
router.put("/:id", secureAPI(["admin"]), async (req, res, next) => {
  try {
    const result = await userController.updateUser(req.params.id, req.body);
    res.json({ result });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/change-password",
  secureAPI(["admin", "user"]),
  async (req, res, next) => {
    try {
      await userController.changePassword(req.currentUser, req.body);
      res.json({ data: "Password Changed Sucessfully." });
    } catch (error) {
      next(error);
    }
  },
);

router.patch("/:id/block", secureAPI(["admin"]), async (req, res, next) => {
  try {
    const data = await userController.blockUser(req.params.id);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
