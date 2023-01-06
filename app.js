var createError = require('http-errors');
const bodyParser = require('body-parser');
var express = require('express');

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var app = express();
app.use(cors());

var indexRouter = require('./routes/index');
var setupRouter = require('./routes/setup.route');
const req = require('express/lib/request');

app.use(bodyParser.urlencoded({ extended: true }));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'dist/coa-mapper-tool')));

app.use('/', indexRouter);
app.use('/setup', setupRouter);

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//     next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//     // set locals, only providing error in development
//     res.locals.message = err.message;
//     res.locals.error = req.app.get('env') === 'development' ? err : {};

//     // render the error page
//     res.status(err.status || 500);
//     res.render('error');
// });

require("./routes/setup.route")(app);
require("./routes/app_definition.route")(app);
require("./routes/segment_definition.route")(app);
require("./routes/segment_mapping.route")(app);
require("./routes/mapping_value.route")(app);
require("./routes/criteria.route")(app);
require("./routes/bulk_upload.route")(app);

app.listen(3001, () => {
    console.log('COA @ localhost:3001');
});

module.exports = app;