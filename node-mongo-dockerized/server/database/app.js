"use strict";

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const Dealership = require("./models/dealership");
const Review = require("./models/review");

const app = express();
app.use(cors());
app.use(express.json());

// Docker-compose içinde Mongo hostname: "mongo"
const MONGO_URL = process.env.MONGO_URL || "mongodb://mongo:27017/dealerships";
const PORT = process.env.PORT || 3030;

function readJsonFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

async function seedIfEmpty() {
  const dealershipsPath = path.join(__dirname, "data", "dealerships.json");
  const reviewsPath = path.join(__dirname, "data", "reviews.json");

  // Dealership seed
  const dealerCount = await Dealership.countDocuments();
  if (dealerCount === 0) {
    if (!fs.existsSync(dealershipsPath)) {
      console.warn("dealerships.json not found at:", dealershipsPath);
    } else {
      const dealerships = readJsonFile(dealershipsPath);
      if (Array.isArray(dealerships) && dealerships.length > 0) {
        await Dealership.insertMany(dealerships, { ordered: false });
        console.log(`Seeded dealerships: ${dealerships.length}`);
      } else {
        console.warn("dealerships.json is empty or not an array.");
      }
    }
  } else {
    console.log(`Dealerships already exist: ${dealerCount}`);
  }

  // Reviews seed
  const reviewCount = await Review.countDocuments();
  if (reviewCount === 0) {
    if (!fs.existsSync(reviewsPath)) {
      console.warn("reviews.json not found at:", reviewsPath);
    } else {
      const reviews = readJsonFile(reviewsPath);
      if (Array.isArray(reviews) && reviews.length > 0) {
        await Review.insertMany(reviews, { ordered: false });
        console.log(`Seeded reviews: ${reviews.length}`);
      } else {
        console.warn("reviews.json is empty or not an array.");
      }
    }
  } else {
    console.log(`Reviews already exist: ${reviewCount}`);
  }
}

// Health
app.get("/", (req, res) => {
  res.json({ message: "Node/Mongo API is running", mongo: MONGO_URL });
});

// fetchReviews (all)
app.get("/fetchReviews", async (req, res) => {
  try {
    const reviews = await Review.find({}).lean();
    return res.status(200).json(reviews);
  } catch (e) {
    return res.status(500).json({ message: "Unable to fetch reviews", error: String(e) });
  }
});

// fetchReviews/dealer/:id
app.get("/fetchReviews/dealer/:id", async (req, res) => {
  try {
    const dealerId = Number(req.params.id);
    if (Number.isNaN(dealerId)) {
      return res.status(400).json({ message: "Invalid dealer id" });
    }
    const reviews = await Review.find({ dealership: dealerId }).lean();
    return res.status(200).json(reviews);
  } catch (e) {
    return res.status(500).json({ message: "Unable to fetch dealer reviews", error: String(e) });
  }
});

// fetchDealers (all)
app.get("/fetchDealers", async (req, res) => {
  try {
    const dealers = await Dealership.find({}).lean();
    return res.status(200).json(dealers);
  } catch (e) {
    return res.status(500).json({ message: "Unable to fetch dealers", error: String(e) });
  }
});

// fetchDealers/:state
app.get("/fetchDealers/:state", async (req, res) => {
  try {
    const stateParam = req.params.state;

    // Basit case-insensitive eşleşme
    const dealers = await Dealership.find({
      state: { $regex: new RegExp(`^${stateParam}$`, "i") }
    }).lean();

    return res.status(200).json(dealers);
  } catch (e) {
    return res.status(500).json({ message: "Unable to fetch dealers by state", error: String(e) });
  }
});

// fetchDealer/:id
app.get("/fetchDealer/:id", async (req, res) => {
  try {
    const dealerId = Number(req.params.id);
    if (Number.isNaN(dealerId)) {
      return res.status(400).json({ message: "Invalid dealer id" });
    }
    const dealer = await Dealership.findOne({ id: dealerId }).lean();
    if (!dealer) {
      return res.status(404).json({ message: "Dealer not found" });
    }
    return res.status(200).json(dealer);
  } catch (e) {
    return res.status(500).json({ message: "Unable to fetch dealer", error: String(e) });
  }
});

// insert_review
app.post("/insert_review", async (req, res) => {
  try {
    const body = req.body || {};

    const dealership = Number(body.dealership);
    const reviewText = body.review;

    if (Number.isNaN(dealership) || !reviewText) {
      return res.status(400).json({
        message: "Invalid review payload. Required: dealership (number), review (string)"
      });
    }

    // Yeni id üret (basit): max(id)+1
    const last = await Review.findOne({}, { id: 1 }).sort({ id: -1 }).lean();
    const newId = last?.id ? Number(last.id) + 1 : 1;

    const doc = await Review.create({
      ...body,
      id: newId,
      dealership
    });

    return res.status(201).json({
      message: "Review inserted",
      review: doc.toObject()
    });
  } catch (e) {
    // duplicate key vb.
    return res.status(500).json({ message: "Unable to insert review", error: String(e) });
  }
});

async function start() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB:", MONGO_URL);

    await seedIfEmpty();

    app.listen(PORT, () => {
      console.log(`Node server running on port ${PORT}`);
    });
  } catch (e) {
    console.error("Startup error:", e);
    process.exit(1);
  }
}

start();
