const express = require('express')
var router = express.Router()

/**
 * 新建用户
 */
router.post('/', (req, res) => {
  console.log('create user', req.body);
  var newUser = new User(req.body);
  newUser.created = new Date();
  newUser.save(err => {
    if (err) {
      res.status(500).json(err);
      return;
    }
    res.json(newUser);
  });
});

module.exports = router
