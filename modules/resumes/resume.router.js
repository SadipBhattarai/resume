const router = require("express").Router();
const resumeController = require("./resume.controller");
const { secureAPI } = require("../../utils/secure");

router.get("/", secureAPI(["admin", "user"]), async (req, res, next) => {
  try {
    const { page, limit, title } = req.query;
    const search = { title, user: req.currentUser };
    const result = await resumeController.list({ page, limit, search });
    res.json(result);
  } catch (error) {
    next(error);
  }
});
router.get("/:id", secureAPI(["admin", "user"]), async (req, res, next) => {
  try {
    const result = await resumeController.getById(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});
router.post("/", secureAPI(["admin", "user"]), async (req, res, next) => {
  try {
    req.body.user = req.currentUser;
    const result = await resumeController.create(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", secureAPI(["admin", "user"]), async (req, res, next) => {
  try {
    const result = await resumeController.updateById(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});
router.delete("/:id", secureAPI(["admin", "user"]), async (req, res, next) => {
  try {
    const result = await resumeController.remove(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
