var passport = require("passport"),
  FacebookStrategy = require("passport-facebook").Strategy;
var User = require("../models/User");
let environment = process.env;

passport.use(
  new FacebookStrategy(
    {
      clientID: environment.FACEBOOK_CLIENT_ID,
      clientSecret: environment.FACEBOOK_CLIENT_SECRET,
      callbackURL: "http://127.0.0.1:3000/auth/facebook/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        //   User.findOrCreate(
        //     { name: profile.displayName },
        //     { name: profile.displayName, userid: profile.id },
        //     function(err, user) {
        //       if (err) {
        //         return done(err);
        //       }
        //       done(null, user);
        //     }
        //   );
    }
  )
);

module.exports = passport;
