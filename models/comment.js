const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  comment: String,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    autopopulate: true,
  },
  replies: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      autopopulate: { maxDepth: 10 },
    },
  ],
  listingId: {
    type: Schema.Types.ObjectId,
    ref: "Listing",
  },
  commentType: {
    type: String,
    default: "comment",
  }
});

commentSchema.plugin(require("mongoose-autopopulate"));

module.exports = mongoose.model("Comment", commentSchema);
