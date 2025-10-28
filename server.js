const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });

const app = require("./index");

const PORT = process.env.PORT || 3000;
const DB = process.env.DATABASE;

// Connect to Database
mongoose
  .connect(DB)
  .then(() => {
    console.log("Database connection successful");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });

//   Start express server
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
