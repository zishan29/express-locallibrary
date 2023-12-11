const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const mongoose = require('mongoose');
const compression = require('compression');
const helmet = require('helmet');
const RateLimit = require('express-rate-limit');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const catalogRouter = require('./routes/catalog'); // Import routes for "catalog" area of site

const app = express();

mongoose.set('strictQuery', false);

const dev_db_url =
  'mongodb+srv://admin:admin123@cluster0.h9e7coo.mongodb.net/local_library?retryWrites=true&w=majority';

const mongoDB = process.env.MONGODB_URI || dev_db_url;

const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
});

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(compression()); // Compress all routes

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      'script-src': ["'self'", 'code.jquery.com', 'cdn.jsdelivr.net'],
    },
  }),
);

app.use(limiter);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog', catalogRouter); // Add catalog routes to middleware chain.

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
