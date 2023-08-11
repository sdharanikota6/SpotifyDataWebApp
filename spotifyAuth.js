const passport = require("passport");
const SpotifyStrategy = require("passport-spotify").Strategy;

passport.use(
  new SpotifyStrategy(
    {
      clientID: "d74f393282a84360bca0f5449642c2da",
      clientSecret: "9705457a44d5453a9b573775082675df",
      callbackURL: "http://localhost:3000/callback",
    },
    (accessToken, refreshToken, expires_in, profile, done) => {
      profile.accessToken = accessToken;
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

module.exports = passport;
