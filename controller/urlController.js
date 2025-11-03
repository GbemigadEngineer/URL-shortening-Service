const Url = require("../model/urlModel");
const catchAsync = require("../utils/catchAsync");
const nanoid = require("nanoid");

// Create a new shortened URL
const createShortUrl = catchAsync(async (req, res, next) => {
  const { originalUrl } = req.body;

  // Check if original URL already exists
  const existing = await Url.findOne({ originalUrl });
  if (existing) {
    return res.status(200).json({
      status: "success",
      data: {
        shortUrl: existing.shortUrl,
        originalUrl: existing.originalUrl,
        clicks: existing.clicks,
        createdAt: existing.dateCreated,
      },
    });
  }

  // Create new short URL
  const shortUrl = nanoid.nanoid();
  const newUrl = await Url.create({ originalUrl, shortUrl });

  res.status(201).json({
    status: "success",
    data: {
      shortUrl: newUrl.shortUrl,
      originalUrl: newUrl.originalUrl,
      clicks: newUrl.clicks,
      createdAt: newUrl.dateCreated,
    },
  });
});

// Return the original URL (for frontend redirection)
const getOriginalUrl = catchAsync(async (req, res, next) => {
  const { shortUrl } = req.params;

  const url = await Url.findOneAndUpdate(
    { shortUrl },
    { $inc: { clicks: 1 } },
    { new: true }
  );

  if (!url) {
    return res.status(404).json({
      status: "fail",
      message: "URL not found",
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      originalUrl: url.originalUrl,
      clicks: url.clicks,
      createdAt: url.dateCreated,
    },
  });
});
const redirectToOriginalUrl = catchAsync(async (req, res, next) => {
  const { shortUrl } = req.params;

  const url = await Url.findOneAndUpdate(
    { shortUrl },
    { $inc: { clicks: 1 } },
    { new: true }
  );

  if (!url) {
    return res.status(404).send("Short URL not found");
  }

  //  Only send redirect — no other response
  return res.redirect(url.originalUrl);
});

const getAllUrls = catchAsync(async (req, res, next) => {
  const urls = await Url.find().sort({ dateCreated: -1 });

  res.status(200).json({
    status: "success",
    data: urls,
  });
});

module.exports = {
  createShortUrl,
  getOriginalUrl,
  redirectToOriginalUrl,
  getAllUrls
};
