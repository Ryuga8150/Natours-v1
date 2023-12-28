const path = require("path");
const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const cors = require("cors");

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const bookingRouter = require("./routes/bookingRoutes");
const bookingController = require("./controllers/bookingController");
const viewRouter = require("./routes/viewRoutes");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

app.set("trust proxy", `${req.hostname}`);
app.set("view engine", "pug");
// console.log(__dirname);

app.set("views", path.join(__dirname, "views")); // need from root module
// join is used as to prevent the error whether the path contains a / or not

// Serving static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, "public")));

// 1) GLOBAL MIDDLEWARES
// Implement CORS
app.use(cors());
// Access-Control-Allow-Origin *
// api.natours.com, front-end natours.com
// app.use(cors({
//   origin:'https://www.natours.com'
// }))

app.options("*", cors());
// app.options("/api/v1/tours/:id", cors());

// Security HTTP headers
app.use(helmet());

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// Limit requests from same API
const limiter = rateLimit({
  max: 100, // 100 requests
  windowMs: 60 * 60 * 1000, // 60 min
  message: "Too many requests from this IP, please try again in an hour",
});

app.use("/api", limiter);

app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  bookingController.webhookCheckout
);

// Data sanitization against NOSQL query injection

// BODY PARSER, reading data from body into req.
// limit set to req.body data's
app.use(express.json({ limit: "10kb" }));
// for parsing data in form data
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
// Problem
// we know password then we write email as email:{gt:""}
// and we are logged in which is an error
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution

// problem &sort=price &sort=duration
// throws error as only one sort field should be there as implemented that way

// Solution use hpp
// to allow some parameters we use whitelist in the option
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

app.use(compression());

// Test Middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);

  next();
});
// 3) Routes

app.use("/", viewRouter);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/bookings", bookingRouter);

// for handling not found
app.all("*", (req, res, next) => {
  // res.status(404).json({
  //   status: "fail",
  //   message: `Can't find ${req.originalUrl} on this server!`,
  // });

  const err = new Error(`Can't find ${req.originalUrl} on this server`);

  err.status = "fail";
  err.statusCode = 404;

  // way to skip all middlewares and search for error handling middleware
  // next(param) denotes error
  next(err);
});

app.use(globalErrorHandler);

module.exports = app;
