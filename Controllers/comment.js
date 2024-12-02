const Comment = require("../models/comment");

module.exports.createComment = async (req, res) => {
  const newComment = new Comment();
  newComment.comment = req.body.comment;
  newComment.author = req.user._id;
  newComment.listingId = req.params.id2;
  await newComment.save();
  req.flash("success", "Comment added!");
  res.redirect(`/clubs/${req.params.id}/listings/${req.params.id2}`);
};

module.exports.replyComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id3);
    const newReply = new Comment({
      comment: req.body.reply,
      author: req.user._id,
    });
    comment.replies.push(newReply);
    newReply.listingId = req.params.id2;
    newReply.commentType = "reply";
    await newReply.save();
    await comment.save();
    req.flash("success", "Comment added!");
    res.redirect(`/clubs/${req.params.id}/listings/${req.params.id2}`);
  } catch (err) {
    console.error(err);
  }
};

module.exports.updateComment = async (req, res) => {
  try {
    const { id2, id3 } = req.params;
    const { comment } = req.body;
    await Comment.findByIdAndUpdate(id3, { comment });
    req.flash("success", "Comment Updated!");

    res.redirect(`/clubs/${req.params.id}/listings/${req.params.id2}`);
  } catch (err) {
    console.error(err);
  }
};

async function deleteCommentAndReplies(commentId) {
  const comment = await Comment.findById(commentId);
  for (const replyId of comment.replies) {
    await deleteCommentAndReplies(replyId);
  }
  await Comment.findByIdAndDelete(commentId);
}

module.exports.deleteComment = async (req, res) => {
  try {
    const { id2, id3 } = req.params;
    await deleteCommentAndReplies(id3);
    req.flash("success", "Comment Deleted!");
    res.redirect(`/clubs/${req.params.id}/listings/${req.params.id2}`);
  } catch (err) {
    console.error(err);
  }
};
