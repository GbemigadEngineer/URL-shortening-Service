const express = require("express");
const {
  createShortUrl,
  getOriginalUrl,
  getAllUrls,
} = require("../controller/urlController");

const router = express.Router();

router.route("/").post(createShortUrl);
router.route("/lookup/:shortUrl").get(getOriginalUrl);
router.get("/all", getAllUrls);

module.exports = router;
