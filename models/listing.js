const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Comment = require("./comment"); 
const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url: String,
    fileName: String,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  club: {
    type: Schema.Types.ObjectId,
    ref: "Club",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

listingSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

listingSchema.post("findOneAndDelete", async (doc) => {
  if (doc) {
    await Comment.deleteMany({ listingId: doc._id });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
