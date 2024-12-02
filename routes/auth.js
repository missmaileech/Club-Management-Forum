const express = require("express");
const router = express.Router();
const authController = require("../Controllers/auth");

router.get(
  "/",
  authController.blockAuthenticated,
  authController.renderLogin
);

router.get("/google", authController.googleAuth);

router.get(
  "/google/callback",
  authController.googleAuthCallback,
  authController.googleAuthSuccess
);

router.get("/logout", authController.logout);

module.exports = router;
