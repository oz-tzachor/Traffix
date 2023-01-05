const express = require("express");
const router = express.Router();
const { decrypt, encrypt } = require("../DL/crypto-js/encrypt");
const { mail } = require("../DL/mails/mails");
const { greeting } = require("../DL/mails/templates");

router.get("/mail", async (req, res) => {
  console.log("arrived to mail");
  mail(req.body.text);
  res.send("Mail sent");
});
router.get("/encrypt", async (req, res) => {
  res.send(encrypt(req.body.text));
});
router.get("/decrypt", async (req, res) => {
  res.send(decrypt(req.body.text));
});
module.exports = router;
