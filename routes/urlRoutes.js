const express = require("express");
const {
  createShortUrl,
  redirectToOriginalUrl,
} = require("../controller/urlController");

const router = express.Router();

router.route("/").post(createShortUrl);
router.route("/:shortUrl").get(redirectToOriginalUrl);

module.exports = router;
