const router = require("express").Router();
const userController = require("../users/user.controller");
router.post("/login", async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
});
router.post("/register", async (req, res, next) => {
  try {
    const result = await userController.register(req.body);
    req.json({ data: `User Registered Sucessfully` });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
