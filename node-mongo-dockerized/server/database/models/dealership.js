const mongoose = require("mongoose");

const dealershipSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },

    // Aşağıdaki alanlar JSON'ınıza göre değişebilir.
    // strict:false sayesinde JSON'daki ekstra alanlar da saklanır.
    city: { type: String },
    state: { type: String },
    address: { type: String },
    zip: { type: String },
    short_name: { type: String },
    full_name: { type: String },
    lat: { type: Number },
    long: { type: Number }
  },
  { strict: false, timestamps: true }
);

module.exports = mongoose.model("Dealership", dealershipSchema);
