const router = require("express").Router();

const userRouter = require("../modules/users/user.router");
router.get("/", (req, res, next) => {
  try {
    res.json({ data: `API is woking properly` });
  } catch (error) {
    next(error);
  }
});
router.use("/api/v1/users", userRouter);
module.exports = router;
