const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Listing = require("./listing.js");

const clubSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  coordinators: [
    {
      img: {
        url: String,
        fileName: String,
      },
      name: String,
      rollNo: String,
    },
  ],
  image: {
    url: String,
    fileName: String,
  },
  description: String,
  about: [
    {
      title: String,
      desc: String,
    },
  ],
  admins: [
    {
      email: String,
    },
  ],
  views: {
    type: Number,
    default: 0,
  },
  followers: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

clubSchema.post("findOneAndDelete", async (club) => {
  if (club) {
    await Listing.deleteMany({ club: club._id });
  }
});

const Club = mongoose.model("Club", clubSchema);
module.exports = Club;
