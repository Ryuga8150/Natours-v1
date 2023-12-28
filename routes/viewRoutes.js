const express = require("express");
const router = express.Router();

const authController = require("./../controllers/authController");
const viewsController = require("./../controllers/viewsController");
const bookingController = require("../controllers/bookingController");

// router.get("/", (req, res) => {
//   res.status(200).render("base", {
//     tour: "The Forest hiker",
//     user: "Ryuga",
//   });
//   // will look in folder we specified above
// });

// router.use(authController.isLoggedIn);
// We removed above middleware as
// for /me we had protect which offers same functionality as isLoggedin
// so to avoid that added the isloggedin middleware where it was required

router.use(viewsController.alerts);

router.get(
  "/",
  // bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewsController.getOverview
);

router.get("/tour/:slug", authController.isLoggedIn, viewsController.getTour);

router.get("/login", authController.isLoggedIn, viewsController.getLoginForm);
router.get("/me", authController.protect, viewsController.getAccount);
router.get("/my-tours", authController.protect, viewsController.getMyTours);

router.post(
  "/submit-user-data",
  authController.protect,
  viewsController.updateUserData
);

module.exports = router;
