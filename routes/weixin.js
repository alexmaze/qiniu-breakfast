const express = require('express')
const router = express.Router()
const crypto = require('crypto')
const superagent = require('superagent')

const config = require('../config.js');

const token = config.token
const appid = config.appid
const appsecret = config.appsecret
const front_url = config.front_url

var basic_access_token = undefined
var js_ticket = undefined

const user = require('../models/user.js');
const User = user.User;

router.get('/test_status', (req, res) => {
  res.json({
    access_token: basic_access_token,
    js_ticket: js_ticket
  })
})

/**
 * 获取 jsconfig
 */
router.get('/jsconfig', (req, res) => {
  var timestamp = getTimesTamp()
  var noncestr = getNonceStr()
  var str = 'jsapi_ticket=' + js_ticket + '&noncestr='+ noncestr+'&timestamp=' + timestamp + '&url=' + front_url
  var signature = crypto.createHash('sha1').update(str).digest('hex')
  res.json({
    appId: appid,
    timestamp: timestamp,
    nonceStr: noncestr,
    signature: signature
  })
})

/**
 * 微信服务器校验
 */
router.get('/wechat', (req, res) => {

  var signature = req.query.signature
  var timestamp = req.query.timestamp
  var nonce = req.query.nonce
  var echostr = req.query.echostr
  if (check(signature, timestamp, nonce)) {
      res.send(echostr)   // 确认来源是微信，并把echostr返回给微信服务器。
  } else {
      res.status(400).json({ code : -1, msg : 'You aren\'t wechat server !'})
  }
})

/**
 * 获取用户 code 微信回调
 */
router.get('/wechat/auth', (req, res) => {
  console.log('#############', req.query.code, req.query.state)
  var url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appid}&secret=${appsecret}&code=${req.query.code}&grant_type=authorization_code`
  superagent.get(url).end((req1, res1) => {
    var data = JSON.parse(res1.text)
    var openid = data.openid
    var access_token = data.access_token
    // console.log(openid, access_token)

    User.find({
      openid: openid
    }).exec((err, users) => {
      if (err) {
        res.status(500).json('db error', err);
      }
      if (users.length > 0) {
        res.render('pages/index', users[0]);
      } else {
        res.render('pages/register', {
          openid
        })
      }
    })
    // res.redirect(front_url+'#'+req.query.state+'/?openid='+openid)
  })
})

module.exports = router

function check (signature, timestamp, nonce) {
  var tmpArr = Array(token, timestamp, nonce).sort().join("");
  var sha1 = crypto.createHash('sha1');
  sha1.update(tmpArr);
  tmpArr = sha1.digest('hex');
  return (tmpArr == signature);
}

function getTimesTamp() {
  return parseInt(new Date().getTime() / 1000) + ''
}

function getNonceStr() {
  return Math.random().toString(36).substr(2, 15)
}

function getNewTicket(token, cb) {
  var url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${basic_access_token}&type=jsapi`
  console.log(url)
  superagent.get(url).end((error, res, body) => {
    // console.log('****', error, res)
    if (error) {
      cb('getNewTicket error', error)
    } else {
      try {
        var ticket = JSON.parse(res.text).ticket
        cb(null, ticket)
      } catch (e) {
        cb('getNewTicket error', e)
      }
    }
  })
}

//---------------
// 获取 basic access token
var url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${appsecret}`
function fetchWeixin() {
  console.log('尝试获取 access tocken');
  superagent.get(url).end((req2, res2) => {
    console.log('获取到 basic access tocken')
    basic_access_token = JSON.parse(res2.text).access_token

    // 刷新 js_ticket
    getNewTicket(basic_access_token, (error, ticket) => {
      console.log('获取到 js ticket')
      js_ticket = ticket
    })
    setTimeout(fetchWeixin, 7000000)
  })
}
fetchWeixin()