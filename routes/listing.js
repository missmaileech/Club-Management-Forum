const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router();
const listingController = require("../Controllers/listing")
const Listing = require("../models/listing");

router.route("/")
    .get(wrapAsync(listingController.index));

module.exports = router;