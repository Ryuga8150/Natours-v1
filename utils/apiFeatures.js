class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };

    // 1A) BASIC FILTERING
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    //console.log(queryObj);
    // 1B) ADVANCED FILTERING

    let queryStr = JSON.stringify(queryObj);
    //console.log(queryObj);

    // structure we get
    // {difficulty:'easy',duration:{gte: 5}}
    // structure we want
    // {difficulty:'easy',duration:{$gte: 5}}
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    //console.log(JSON.parse(queryStr));

    //let query = Tour.find(JSON.parse(queryStr));
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }
  sort() {
    if (this.queryString.sort) {
      //console.log(req.query);
      // for more sort fields
      // required "price ratings Average"

      const sortBy = this.queryString.sort.split(",").join(" ");
      // for ascending sort=price
      this.query = this.query.sort(sortBy);

      // for descending sort= - price
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      // to exlcude field
      this.query = this.query.select("-__v");
    }

    return this;
  }
  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    // i/p: page=2 & limit=10
    this.query = this.query.skip(skip).limit(limit);

    // if (this.queryString.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) throw new Error("This page does not exist");
    // }

    return this;
  }
}

module.exports = APIFeatures;
