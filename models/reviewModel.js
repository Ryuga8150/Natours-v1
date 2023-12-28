const mongoose = require("mongoose");
const Tour = require("./tourModel");
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review cannot be empty!"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "Review must belong to a tour."],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user."],
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// to allow only 1 use to have only 1 review for a tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// Parent referencing good when we don't know how much the arra will grow

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: "tour",
  //   select: "name",
  // }).populate({
  //   path: "user",
  //   select: "name photo",
  // });

  this.populate({
    path: "user",
    select: "name photo",
  });

  next();
});

// static methods
// because we want to call aggregate on that
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  // console.log(stats);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

// post because current document should also be calculated
reviewSchema.post("save", function () {
  // this points to current review
  // since calc method is on Review model
  // but review model is not here
  // we get review model by this.costructor
  this.constructor.calcAverageRatings(this.tour);
});

// A document is updated or deleted
// by findByIDAndUpdate and delete
// document middleware is not available on them only query middleware
// is available

reviewSchema.pre(/^findOneAnd/, async function (next) {
  // idea is will excute query to get document
  this.r = await this.findOne();
  // console.log(this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // idea is will excute query to get document
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
