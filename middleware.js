const {
  clubSchema,
  listingSchema,
  commentSchema,
  replyCommentSchema,
} = require("./schema.js");
const express = require("express");
const ExpressError = require("./utils/ExpressError.js");
const Club = require("./models/club.js");
const Comment = require("./models/comment.js");

getAdminEmails = async (clubId) => {
  try {
    const club = await Club.findById(clubId);
    if (!club) {
      console.log(`Club ID ${clubId} not found!`);
    }

    const adminEmails = club.admins.map((admin) => admin.email).join(", ");
    return adminEmails;
  } catch (error) {
    console.error(error);
    return null;
  }
};

module.exports.ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "You must be logged in.");
  req.session.redirectUrl = req.originalUrl;
  return res.redirect("/auth");
};

module.exports.validateClub = (req, res, next) => {
  let { error } = clubSchema.validate(req.body);
  if (error) {
    next(new ExpressError(400, error));
  }
  next();
};

module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    next(new ExpressError(400, error));
  }
  next();
};

module.exports.validateComment = (req, res, next) => {
  let { error } = commentSchema.validate(req.body);
  if (error) {
    next(new ExpressError(400, error));
  }
  next();
};

module.exports.validateReply = (req, res, next) => {
  let { error } = replyCommentSchema.validate(req.body);
  if (error) {
    next(new ExpressError(400, error));
  }
  next();
};

module.exports.isAdmin = async (req, res, next) => {
  let clubId = req.params.id;
  let clubAdmins = await getAdminEmails(clubId);
  if (process.env.ADMIN_LIST) {
    if (
      process.env.ADMIN_LIST.includes(res.locals.currUser.email) ||
      clubAdmins.includes(res.locals.currUser.email)
    ) {
      next();
    } else {
      next(new ExpressError(403, "Access Denied!"));
    }
  } else {
    if (clubAdmins.includes(res.locals.currUser.email)) {
      next();
    } else {
      next(new ExpressError(403, "Access Denied!"));
    }
  }
};

module.exports.isSuperAdmin = (req, res, next) => {
  try {
    if (process.env.ADMIN_LIST) {
      if (process.env.ADMIN_LIST.includes(res.locals.currUser.email)) {
        next();
      } else {
        next(new ExpressError(403, "Access Denied!"));
      }
    } else {
      next(new ExpressError(403, "Access Denied!"));
    }
  } catch (err) {
    next(new ExpressError(400, "Something wrong occurred!"));
  }
};

module.exports.isAuthor = async (req, res, next) => {
  let { id3 } = req.params;
  let comment = await Comment.findById(id3);
    if (!comment.author.equals(res.locals.currUser._id)) {
      req.flash("error", "You are not the author of this comment!");
      return res.redirect(`/clubs/${req.params.id}/listings/${req.params.id2}`);
    }
  next();
};

module.exports.increaseCount = async (req, res, next) => {
  let { id } = req.params;
  try {
    await Club.findByIdAndUpdate(id, { $inc: { views: 1 } });
    next();
  } catch (err) {
    console.log(`Error increase the count on page club id ${id}`);
    next();
  }
};
