var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var app = express();
var weixinRoute = require('./routes/weixin.js');

app.set('port', (process.env.PORT || 5000));

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

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


