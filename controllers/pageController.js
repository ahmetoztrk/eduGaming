exports.getIndexPage = (req, res) => {
  res.status(200).render("index");
};

exports.getAboutPage = (req, res) => {
  res.status(200).render("about");
};

exports.getRegisterPage = (req, res) => {
  res.status(200).render("registration");
};

exports.getLoginPage = (req, res) => {
  res.status(200).render("login");
};

exports.getTeacherDashboardPage = (req, res) => {
  res.status(200).render("teacher_dashboard");
};

exports.getAddStudentPage = (req, res) => {
  res.status(200).render("add_student");
};

/*exports.getUpdateStudentPage = (req, res) => {
  res.status(200).render("update_student");
};*/


