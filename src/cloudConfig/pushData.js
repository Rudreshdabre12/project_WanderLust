require("dotenv").config();
const mongoose = require("mongoose");

// Import Listing model (using .default because the model is exported as ES module default)
const Listing = require("../models/listings.js").default;

// Import your sample data array
const listings = require("./data");
const MONGO_URL = "mongodb+srv://gulkand:gulu@nodetuts.nce3eyt.mongodb.net/Wanderlust?retryWrites=true&w=majority";
const uri = MONGO_URL;

if (!uri) {
  console.error("❌ MONGO_URL not found in environment variables.");
  process.exit(1);
}

async function seedDB() {
  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");

    // Clear previous listings
    await Listing.deleteMany();

    // Insert your listings
    const result = await Listing.insertMany(listings);
    console.log(`🌱 Inserted ${result.length} listings`);

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  } catch (err) {
    console.error("❌ Error seeding data:", err);
  }
}

seedDB();
