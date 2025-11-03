const express = require("express");
const {
  createShortUrl,
  getOriginalUrl,
  getAllUrls,
  redirectToOriginalUrl,
} = require("../controller/urlController");

const router = express.Router();

router.route("/").post(createShortUrl);
router.get("/:shortUrl", redirectToOriginalUrl);
router.route("/lookup/:shortUrl").get(getOriginalUrl);
router.get("/all", getAllUrls);

module.exports = router;
