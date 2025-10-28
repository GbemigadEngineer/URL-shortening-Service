const Url = require("../model/urlModel");
const catchAsync = require("../utils/catchAsync");
const nanoid = require("nanoid");

// create a new shortened URL

const createShortUrl = catchAsync(async (req, res, next) => {
  const { originalUrl } = req.body;

  const shortUrl = nanoid.nanoid();
  const newUrl = await Url.create({ originalUrl, shortUrl: shortUrl });
  res.status(201).json({
    status: "success",
    data: {
      shortUrl: newUrl.shortUrl,
    },
  });
});

// redirect to the original URL
const redirectToOriginalUrl = catchAsync(async (req, res, next) => {
  const { shortUrl } = req.params;
  const url = await Url.findOne({ shortUrl });
  if (!url) {
    return res.status(404).json({
      status: "fail",
      message: "URL not found",
    });
  }
  res.redirect(url.originalUrl);

  //   Increment click count
  url.clicks += 1;
  await url.save();
});
module.exports = {
  createShortUrl,
  redirectToOriginalUrl,
};
