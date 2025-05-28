import mongoose from "mongoose";
const listingSchema = mongoose.Schema({
    title: String,
    description: String,
    image: {
      url: {
        type: String,
        default: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=60"
      },
      filename: String,
      //default:"https://www.google.com/url?sa=i&url=https%3A%2F%2Fdubai-experience.com%2Fhotels-in-dubai%2F&psig=AOvVaw1GnhZcFdkgKOrpFufl2JQq&ust=1748509196412000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCJDqy77mxY0DFQAAAAAdAAAAABAE"
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