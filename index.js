const express = require("express");
const urlRouter = require("./routes/urlRoutes");
const cors = require("cors");
const app = express();

const { redirectToOriginalUrl } = require("./controller/urlController");

// Middleware to parse JSON bodies
app.use(express.json());
// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// CORS middleware for handling cross-origin requests
app.use(cors());

app.use("/api/v1/urls", urlRouter);

app.get("/:shortUrl", redirectToOriginalUrl);

// ⚠️ This route MUST be placed AFTER all API and short URL routes!

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ... your app.listen(PORT, ...) comes after this
// export the app for use in other files
module.exports = app;
