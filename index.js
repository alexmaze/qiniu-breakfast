const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const app = express();
const weixinRoute = require('./routes/weixin.js');
const userRoute = require('./routes/user.js');
const mongoose = require('mongoose');
const config = require('./config.js');

// open databse
mongoose.connect('mongodb://test:axibatestqiniu@ds031865.mlab.com:31865/text');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log('mongodb opened!');
});

app.set('port', (process.env.PORT || 8080));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded( { extended: true } ));
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.redirect(`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${config.appid}&redirect_uri=${config.redirect}&response_type=code&scope=${config.scope}&state=abc#wechat_redirect`)
});

app.use('/api/weixin', weixinRoute);
app.use('/api/user', userRoute);

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


