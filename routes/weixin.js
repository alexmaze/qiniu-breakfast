var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
  // no session
  var query = req.query;
  res.json('hello world!');
});

module.exports = router;
