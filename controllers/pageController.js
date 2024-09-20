exports.getIndexPage = (req, res) => {
  res.status(200).render("index");
};

exports.getAboutPage = (req, res) => {
  res.status(200).render("about");
};

exports.getRegisterPage = (req, res) => {
  res.status(200).render("register");
};

exports.getLoginPage = (req, res) => {
  res.status(200).render("login");
};
