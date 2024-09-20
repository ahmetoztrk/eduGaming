const express = require("express");
const pageController = require("../controllers/pageController");
const redirectMiddleware = require("../middlewares/redirectMiddleware");

const router = express.Router();

router.route("/").get(pageController.getIndexPage);
router.route("/about").get(pageController.getAboutPage);
router
  .route("/register")
  .get(redirectMiddleware, pageController.getRegisterPage);
router.route("/login").get(redirectMiddleware, pageController.getLoginPage);
router.route("/add-student").get(pageController.getAddStudentPage);
router.route("/teacher/dashboard").get(pageController.getTeacherDashboardPage);
//router.route("/update-student").get(pageController.getUpdateStudentPage);

module.exports = router;
