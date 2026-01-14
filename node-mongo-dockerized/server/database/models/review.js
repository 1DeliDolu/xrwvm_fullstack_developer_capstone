const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },

    // Dealer id ile eşleştirmek için:
    dealership: { type: Number, required: true, index: true },

    name: { type: String },
    review: { type: String, required: true },

    purchase: { type: Boolean },
    purchase_date: { type: String },

    car_make: { type: String },
    car_model: { type: String },
    car_year: { type: Number }
  },
  { strict: false, timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
