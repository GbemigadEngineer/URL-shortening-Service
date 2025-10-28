const mongoose = require("mongoose");
const shortId = require("shortid");
const nanoid = require("nanoid");

const urlSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: true,
    },
    shortUrl: {
      type: String,
      unique: true,
      default: undefined,
    },
    dateCreated: {
      type: Date,
      default: Date.now,
    },
    clicks: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);
const Url = mongoose.model("Url", urlSchema);

module.exports = Url;
