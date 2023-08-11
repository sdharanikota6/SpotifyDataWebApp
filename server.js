const express = require("express");
const app = express();
const passport = require("./spotifyAuth");
const helpers = require("./helpers");

app.use(
  require("express-session")({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get(
  "/login",
  passport.authenticate("spotify", {
    scope: [
      "user-read-email",
      "user-read-private",
      "user-top-read",
      "user-read-recently-played",
    ],
    showDialog: true,
  })
);

app.get(
  "/callback",
  passport.authenticate("spotify", { failureRedirect: "/" }),
  function (req, res) {
    res.redirect("/dashboard");
  }
);

app.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      console.error("Error logging out:", err);
      return res.redirect("/dashboard"); // Redirect to the dashboard in case of an error
    }
    res.redirect("/"); // Redirect to the home page after successful logout
  });
});

app.get("/dashboard", helpers.ensureAuthenticated, async function (req, res) {
  try {
    const htmlContent = await helpers.generateDashboardContent(
      req.user.accessToken,
      req.query.time_range
    );
    res.send(htmlContent);
  } catch (error) {
    res
      .status(500)
      .send('<p>Failed to fetch top tracks. <a href="/logout">Logout</a></p>');
  }
});

app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    res.send(helpers.authenticatedHTML());
  } else {
    res.send(helpers.defaultHomePage());
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
