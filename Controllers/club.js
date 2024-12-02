const { isAdmin } = require("../middleware");
const Club = require("../models/club");
const Listing = require("../models/listing");

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

module.exports.index = async (req, res) => {
  const allClubs = await Club.find({}).sort({ __v: -1 });
    res.render("clubs/index.ejs", {allClubs});
}

module.exports.showClub = async (req, res) => {
  let { id } = req.params;
  const club = await Club.findById(id);

  if (!club) {
    req.flash("error", "The club you requested for does not exist!");
    return res.redirect("/clubs");
  }

  let isAdmin = false;
  if (req.user) {
    let clubAdmins = await getAdminEmails(id);
    isAdmin =
      process.env.ADMIN_LIST.includes(req.user.email) ||
      clubAdmins.includes(req.user.email);
  }

  res.render("clubs/showClub", {
    club,
    isAdmin: isAdmin, 
  });
};


module.exports.renderNewClubForm = (req, res) => {
    res.render("clubs/newClub.ejs")
}


module.exports.createClub = async (req, res) => {
  const newClub = new Club(req.body.club);
  const imageFile = req.files.find(file => file.fieldname === 'club[image]');
  const coordinatorFiles = req.files.filter(file => file.fieldname.startsWith('club[coordinators][') && file.fieldname.endsWith('][img]'));
  let url = imageFile.path;
  let fileName = imageFile.originalname;
  newClub.image = { url, fileName };
  newClub.coordinators = req.body.club.coordinators.map((coordinator, index) => {
    const file = coordinatorFiles.find(file => file.fieldname === `club[coordinators][${index}][img]`);
    if (file) {
      coordinator.img = {
        url: file.path,
        filename: file.originalname,
      };
    }
    return coordinator;
  });
  await newClub.save();
  req.flash("success", "New Club created!");
  res.redirect(`/clubs/${newClub._id}`);
};



module.exports.deleteClub = async (req, res) => {
  let { id } = req.params;
  let deletedClub = await Club.findByIdAndDelete(id);
  req.flash("success", "Club Deleted!");
  res.redirect("/clubs");
}

module.exports.renderNewClubEditForm = async (req, res) => {
  let { id } = req.params;
  const club = await Club.findById(id);
  if(!club){
    req.flash("error", "Club you requested for does not exist!");
    res.redirect("/clubs");
  }
res.render("clubs/editClub.ejs", { club  });
}


module.exports.updateClub = async (req, res) => {
  let { id } = req.params;
  try {
    const collection = await Club.findById(id);
    let coordinators = collection.coordinators;
    let club = await Club.findByIdAndUpdate(id, { ...req.body.club }, { new: true });

    const imageFile = req.files.find(file => file.fieldname === 'club[image]');
    const coordinatorFiles = req.files.filter(file => file.fieldname.startsWith('club[coordinators][') && file.fieldname.endsWith('][img]'));

    if (imageFile) {
      let url = imageFile.path;
      let fileName = imageFile.originalname;
      club.image = { url, fileName };
    }

    coordinators = req.body.club.coordinators.map((coordinator, index) => {
      const file = coordinatorFiles.find(file => file.fieldname === `club[coordinators][${index}][img]`);
      if (file) {
        coordinator.img = {
          url: file.path,
          filename: file.originalname,
        };
      } else if (coordinators[index] && coordinators[index].img) {
        // Keep the old image if no new file is provided
        coordinator.img = coordinators[index].img;
      }
      return coordinator;
    });

    club.coordinators = coordinators;
    await club.save();

    req.flash("success", "Club Updated!");
    res.redirect(`/clubs/${id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to update club.");
    res.redirect(`/clubs/${id}`);
  }
};

module.exports.followClub = async (req, res) => {
  const { id } = req.params;
  const club = await Club.findById(id);
  if (!club) {
    req.flash("error", "The club you requested for does not exist!");
    return res.redirect("/clubs");
  }
  club.followers.push(req.user._id);
  await club.save();
  req.flash("success", "You are now following this club!");
  res.redirect(`/clubs/${id}`);
}

module.exports.unfollowClub = async (req, res) => {
  const { id } = req.params;
  const club = await Club.findById(id);
  if (!club) {
    req.flash("error", "The club you requested for does not exist!");
    return res.redirect("/clubs");
  }
  const followerIndex = club.followers.indexOf(req.user._id);
  if (followerIndex > -1) {
    club.followers.splice(followerIndex, 1);
    await club.save();
  }
  req.flash("success", "You have unfollowed this club.");
  res.redirect(`/clubs/${id}`);
}