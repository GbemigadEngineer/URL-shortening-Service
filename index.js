const express = require("express");
const urlRouter = require("./routes/urlRoutes");
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/urls", urlRouter);

// export the app for use in other files
module.exports = app;
