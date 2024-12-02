const passport = require("passport");

exports.blockAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect("/listings");
  }
  next();
};

exports.renderLogin = async (req, res) => {
  res.render("users/login.ejs");
};

exports.googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

exports.googleAuthCallback = passport.authenticate("google", {
  failureRedirect: "/auth",
  failureFlash: true,
});

exports.googleAuthSuccess = (req, res) => {
  req.flash("success", "Successfully logged in!");
  res.send(`
    <script>
      window.opener.location.reload();
      window.close();
    </script>
  `);
};


exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      req.flash("error", "Error logging out. Please try again.");
      return next(err);
    }
    req.flash("success", "Successfully logged out!");
    res.redirect("/");
  });
};
