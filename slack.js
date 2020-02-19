const express = require("express");
const router = express.Router();

router.post("/message",function (req,res) {
  console.log(req);
});

module.exports = router;
