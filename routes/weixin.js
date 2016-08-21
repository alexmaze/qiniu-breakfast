const express = require('express')
const router = express.Router()
const crypto = require('crypto')
const superagent = require('superagent')

const token = 'mytocken'
const appid = 'wxfa27f6d688c8d154'
const appsecret = 'e25cbb6fd01be73d5b64eeb587554672'

const front_url = 'http://alexyan91.ngrok.cc'
var basic_access_token = undefined
var js_ticket = undefined

/**
 * 获取 jsconfig
 */
router.get('/jsconfig', (req, res) => {
  var url = 'http://alexyan91.ngrok.cc/'
  var timestamp = getTimesTamp()
  var noncestr = getNonceStr()
  var str = 'jsapi_ticket=' + js_ticket + '&noncestr='+ noncestr+'&timestamp=' + timestamp + '&url=' + url
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
    res.redirect(front_url+'/#'+req.query.state+'/?openid='+openid)
  })
})

module.exports = router

function check (signature, timestamp, nonce) {
  var tmpArr = [token, timestamp, nonce]
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