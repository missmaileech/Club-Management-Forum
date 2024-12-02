const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const Club = require("../models/club");
const multer = require("multer");
const clubController = require("../Controllers/club");
const listingController = require("../Controllers/listing");
const commentController = require("../Controllers/comment");
const {
  ensureAuthenticated,
  validateClub,
  validateListing,
  validateComment,
  isAdmin,
  isSuperAdmin,
  validateReply,
  isAuthor,
  increaseCount,
} = require("../middleware");

const { storage } = require("../cloudConfig.js");

const uploadClubImg = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.fieldname.startsWith("club[coordinators][") &&
      file.fieldname.endsWith("][img]")
    ) {
      cb(null, true);
    } else if (file.fieldname === "club[image]") {
      cb(null, true);
    } else {
      cb(new Error("Unexpected field"));
    }
  },
});

const uploadListingImg = multer({ storage: storage });

router
  .route("/")
  .get(wrapAsync(clubController.index))
  .post(
    ensureAuthenticated,
    isSuperAdmin,
    uploadClubImg.any(),
    validateClub,
    wrapAsync(clubController.createClub)
  );

router.get("/new", ensureAuthenticated, clubController.renderNewClubForm);

router.get(
  "/:id/edit",
  ensureAuthenticated,
  clubController.renderNewClubEditForm
);

router
  .route("/:id")
  .get(increaseCount, wrapAsync(clubController.showClub))
  .put(
    ensureAuthenticated,
    isAdmin,
    uploadClubImg.any(),
    validateClub,
    wrapAsync(clubController.updateClub)
  )
  .delete(isSuperAdmin, wrapAsync(clubController.deleteClub));

router.post("/:id/follow", ensureAuthenticated, clubController.followClub);

router.post(
  "/:id/unfollow",
  ensureAuthenticated,
  clubController.unfollowClub
);


router.route("/:id/listings").get(wrapAsync(listingController.showListings));
router
  .route("/:id/listings/new")
  .get(listingController.renderNewListingForm)
  .post(
    ensureAuthenticated,
    isAdmin,
    uploadListingImg.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
  );

router
  .route("/:id/listings/:id2/edit")
  .get(
    ensureAuthenticated,
    isAdmin,
    wrapAsync(listingController.renderEditListingForm)
  )
  .put(
    ensureAuthenticated,
    isAdmin,
    uploadListingImg.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.handleUpdateListing)
  );

router
  .route("/:id/listings/:id2/")
  .get(wrapAsync(listingController.viewListing))
  .delete(
    ensureAuthenticated,
    isAdmin,
    wrapAsync(listingController.handleDeleteListing)
  );

router
  .route("/:id/listings/:id2/comments")
  .post(
    ensureAuthenticated,
    validateComment,
    wrapAsync(commentController.createComment)
  );

router
  .route("/:id/listings/:id2/comments/:id3")
  .put(
    ensureAuthenticated,
    isAuthor,
    validateComment,
    wrapAsync(commentController.updateComment)
  )
  .delete(
    ensureAuthenticated,
    isAuthor,
    wrapAsync(commentController.deleteComment)
  );

router
  .route("/:id/listings/:id2/comments/:id3/reply")
  .post(
    ensureAuthenticated,
    validateReply,
    wrapAsync(commentController.replyComment)
  );

module.exports = router;
