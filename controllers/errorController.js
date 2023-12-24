const AppError = require("./../utils/appError");

// Could also implement level of errors
// in case of critical can report to some other person

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  // const value=err.errmsg.match(/(.*?)/);
  // console.log(value);
  // const message=`Duplicate field value: x. Please use another value!`

  // return new AppError(message,400);
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  //console.log(value);
  const message = `Duplicate field value: ${value}. Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = () => {
  return new AppError("Invalid token. Please login!", 401);
};
const handleJWTExpiredError = () => {
  return new AppError("Your token has expired!. Please login again !", 401);
};

const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  console.log("Error", err);
  // RENDERED WEBSITE
  return res.status(err.statusCode).render("error", {
    title: "Something went wrong!",
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith("/api")) {
    // A)Operational, trusted error:send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // B) Programming or other unknown errors: don't leak error details
    // 1) Log Error
    console.log("ERROR", err);
    // could also use error logging packages from npm

    // 2) Send generate message
    return res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
  // RENDERED WEBSITE
  return res.status(err.statusCode).render("error", {
    title: "Something went wrong!",
    msg: "Please try again later.",
  });
};
module.exports = (err, req, res, next) => {
  // 500 internal server error

  // values assigned if undefined
  //const { statusCode = 500, status = "error", message } = err;

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    //console.log("Hii");
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    //let error=err;
    // use real error

    //let error={...err,name:err.name};
    let error = Object.create(err);
    //console.log({...err})
    // after destructuring we couldn't get err.name property from that

    // console.log("err");
    // console.log(err);
    // console.log("error");
    //console.log(error);

    // console.log(err.name);

    // the name property errors are from mongoose
    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);

    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  } else {
    console.log("Invalid error environment");
  }
};
