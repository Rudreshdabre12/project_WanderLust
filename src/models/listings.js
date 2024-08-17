import mongoose from "mongoose";
const listingSchema = mongoose.Schema({
    title: String,
    description: String,
    image: {
      url: String,
      filename: String,
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  });
  listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
      await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
  });
  const Listing=mongoose.models.Listing || mongoose.model('Listing',listingSchema);
  export default Listing;