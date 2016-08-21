const express = require('express')
var router = express.Router()

/**
 * 新建记录
 */
router.post('/:userid', (req, res) => {
  console.log('create record', req.params.userid);
  var record = new Project({
    user: req.params.userid,
    created : new Date()
  });
  record.save(err => {
    if (err) {
      res.status(500).json(err);
      return;
    }
    res.json(record);
  });
});

module.exports = router
