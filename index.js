const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const app = express();
const weixinRoute = require('./routes/weixin.js');
const userRoute = require('./routes/user.js');
const mongoose = require('mongoose');

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
  response.render('pages/index');
});

app.use('/api/weixin', weixinRoute);
app.use('/api/user', userRoute);

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


