const dotenv = require("dotenv");
const mongoose = require("mongoose");
//import mongoose from "mongoose";

process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception! Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: "./config.env" });
const app = require("./app");
// console.log(process.env);
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

/*
useNewUrlParser, useUnifiedTopology, useFindAndModify, and useCreateIndex are no longer supported options.
Mongoose 6 always behaves as if useNewUrlParser, useUnifiedTopology, 
and useCreateIndex are true, and useFindAndModify is false. Please remove these options from your code.
*/
mongoose
  .connect(DB, {
    //useNewUrlParser: true,
    //useCreateIndex: true,
    //useFindAndModify: false,
  })
  .then((con) => {
    //console.log(con);
    console.log("Database Successfully connected");
  });

// const testTour = new Tour({
//   name: "Test Tour 2",
//   number: 24,
//   price: 497,
// });

// testTour
//   .save()
//   .then((doc) => console.log(doc))
//   .catch((err) => console.log(err));

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server started listening at ${process.env.PORT}`);
});

// LAST SAFETY NET
// every error gets carried on process.on which could be used if not handled

// this is for async code
process.on("unhandledRejection", (err) => {
  console.log("Unhandled Rejection! Shutting down...");
  console.log(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});

// Moving on top so we can set listen earlier
// process.on('uncaughtException',err=>{
//   console.log("Uncaught Exception! Shutting down...");
//   console.log(err.name,err.message);

//   server.close(()=>{
//     process.exit(1);
//   })
// })

//console.log(x)
