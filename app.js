if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");

const ExpressError = require("./utils/ExpressError.js");

const ejsMate = require("ejs-mate");

const mongoose = require("mongoose");
const mongoStore = require("connect-mongo");

const dbUrl = process.env.ATLASDB_URL;


main()
.then(() => {
  console.log("connected to DB");
})
.catch((err) => {
    console.log(err);
  });
  
  async function main() {
    await mongoose.connect(dbUrl);
}

const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

  const store = mongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
      secret: process.env.SECRET,
    },
    touchAfter: 24 * 60 * 60,
  });

  store.on("error", (err) => {
    console.log("ERROR IN MONGO SESSION STORE", err);
  });


  const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    },
  };

  const User = require("./models/user")


  app.use(session(sessionOptions));
  app.use(passport.initialize());
  app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.NODE_ENV === "production"
          ? `${process.env.WEB_URL}/auth/google/callback`
          : "http://localhost:8080/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      const newUser = {
        googleId: profile.id,
        username: profile.displayName,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        image: profile.photos[0].value,
        email: profile.emails[0].value,
      };
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (user) {
          done(null, user);
        } else {
          user = await User.create(newUser);
          done(null, user);
        }
      } catch (err) {
        console.error("Error occurred at creating new user.", err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// home route
app.get("/", (req, res) => {
  res.redirect("/listings");
})

// listing route
const listingRouter = require("./routes/listing");
app.use("/listings", listingRouter);

// listing of clubs
const clubRouter = require("./routes/club")
app.use("/clubs", clubRouter);

// user signup or login
const authRouter = require("./routes/auth");
app.use("/auth", authRouter)

// unreachable pages
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

// custom error message
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  console.log(err);
  res.status(statusCode).render("includes/error.ejs", { err });
});


app.listen(8080, '0.0.0.0', () => {
  console.log("server is listening to port 8080");
});
