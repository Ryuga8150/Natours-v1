import axios from "axios";
import { showAlert } from "./alert";
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_CLIENT_KEY);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // console.log(session);

    // 2) Create checkout form + change Credit Card
    window.location.href = session.data.session.url;
    // await stripe.redirectToCheckout({
    //   sessionId: session.data.session.id,
    // });
  } catch (err) {
    console.log(err);
    showAlert("error", err);
  }
};
