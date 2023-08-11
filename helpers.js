const axios = require("axios");

async function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

async function generateDashboardContent(
  accessToken,
  timeRange = "medium_term"
) {
  const options = {
    method: "GET",
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  };

  try {
    const topTracksResponse = await axios.get(
      `https://api.spotify.com/v1/me/top/tracks?limit=5&time_range=${timeRange}`,
      options
    );
    const topTracksData = topTracksResponse.data;
    const topTracks = topTracksData.items;

    let trackListHTML = "";
    for (let track of topTracks) {
      const { name, album, external_urls } = track;
      const trackLink = external_urls.spotify;
      trackListHTML += `
          <div class="track">
              <img src="${album.images[0].url}" alt="${name} album cover">
              <div class="track-info">
                  <h2>${name}</h2>
                  <p>Artist: ${album.artists[0].name}</p>
                  <a href="${trackLink}" target="_blank">Play on Spotify</a>
              </div>
          </div>
      `;
    }

    const topArtistsResponse = await axios.get(
      `https://api.spotify.com/v1/me/top/artists?limit=5&time_range=${timeRange}`,
      options
    );
    const topArtistsData = topArtistsResponse.data;
    const topArtists = topArtistsData.items;

    let artistListHTML = "";
    for (let artist of topArtists) {
      const { name, images, external_urls } = artist;
      const artistLink = external_urls.spotify;
      artistListHTML += `
          <div class="artist">
              <img src="${images[0].url}" alt="${name} profile picture">
              <div class="artist-info">
                  <h2>${name}</h2>
                  <a href="${artistLink}" target="_blank">View on Spotify</a>
              </div>
          </div>
      `;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Dashboard</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background: linear-gradient(rgba(30,87,153,1), rgba(125,185,232,1));
                  color: white;
                  text-align: center;
                  padding: 20px;
              }

              .track, .artist {
                display: flex;
                align-items: center;
                margin: 20px 0; 
                justify-content: space-between;
            }
            
            .track img, .artist img {
                width: 100px;
                margin-right: 20px;
            }
            
            .track-info, .artist-info {
                flex-grow: 1;
                text-align: left;
            }
            

              a {
                  margin: 0 10px;
                  color: white;
                  text-decoration: none;
              }

              a:hover {
                  text-decoration: underline;
              }

              .time-range-selector {
                  margin-bottom: 20px;
              }

              .time-range-selector a {
                  margin: 0 10px;
                  padding: 5px 10px;
                  background: rgba(255, 255, 255, 0.2);
                  border-radius: 5px;
              }

              .time-range-selector a.selected {
                  background: rgba(255, 255, 255, 0.5);
              }

              .dashboard-content {
                  display: flex;
                  justify-content: space-between;
              }

              .tracks-section, .artists-section {
                  width: 48%; /* Not 50% because we want a tiny space between them */
              }

          </style>
      </head>
      <body>
          <div class="time-range-selector">
              <a href="/dashboard?time_range=short_term" class="${
                timeRange === "short_term" ? "selected" : ""
              }">Past Month</a>
              <a href="/dashboard?time_range=medium_term" class="${
                timeRange === "medium_term" ? "selected" : ""
              }">Past 6 Months</a>
              <a href="/dashboard?time_range=long_term" class="${
                timeRange === "long_term" ? "selected" : ""
              }">All Time</a>
          </div>
          <div class="dashboard-content">
              <div class="tracks-section">
                  <h2>Top Tracks</h2>
                  ${trackListHTML}
              </div>
              <div class="artists-section">
                  <h2>Top Artists</h2>
                  ${artistListHTML}
              </div>
          </div>
          <a href="/logout">Logout</a>
      </body>
      </html>
  `;

    return htmlContent;
  } catch (error) {
    console.error("Error fetching top tracks or artists:", error);
    throw new Error("Failed to fetch top tracks or artists.");
  }
}

function defaultHomePage() {
  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Spotify Integration App</title>
          <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet">
          <style>
              body {
                  font-family: 'Montserrat', sans-serif;
                  background: linear-gradient(rgba(30,87,153,1), rgba(125,185,232,1));
                  color: white;
                  text-align: center;
                  height: 100vh;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  flex-direction: column;
              }
  
              img {
                  width: 150px;
                  margin-bottom: 20px;
              }
  
              a {
                  color: #61dafb;
                  text-decoration: none;
                  font-weight: bold;
                  border: 2px solid #61dafb;
                  padding: 10px 20px;
                  border-radius: 3px;
                  transition: background-color 0.2s;
              }
  
              a:hover {
                  background-color: #61dafb;
                  color: #282c34;
              }
          </style>
      </head>
      <body>
          <img src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_White.png" alt="Spotify Logo">
          <h1>Welcome to my Spotify Data App!</h1>
          <a href="/login">Login with Spotify</a>
      </body>
      </html>
    `;
}

function authenticatedHTML() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Logged In</title>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet">
        <style>
            body {
                font-family: 'Montserrat', sans-serif;
                background: linear-gradient(rgba(30,87,153,1), rgba(125,185,232,1));
                color: white;
                text-align: center;
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
            }

            a {
                color: #61dafb;
                text-decoration: none;
                font-weight: bold;
                border: 2px solid #61dafb;
                padding: 10px 20px;
                border-radius: 3px;
                transition: background-color 0.2s;
                margin: 10px; // added this for spacing between links
            }

            a:hover {
                background-color: #61dafb;
                color: #282c34;
            }
        </style>
    </head>
    <body>
        <h1>You are logged in!</h1>
        <a href="/dashboard">Go to Dashboard</a>
        <a href="/logout">Logout</a>
    </body>
    </html>
  `;
}

module.exports = {
  ensureAuthenticated,
  generateDashboardContent,
  defaultHomePage,
  authenticatedHTML,
};
