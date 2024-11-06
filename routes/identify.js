// routes/identify.js
const express = require("express");
const { identifyContact } = require("../controllers/IdentifyController");

const router = express.Router();

router.post("/", identifyContact);

module.exports = router;
