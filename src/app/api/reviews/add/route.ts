import Review from "@/models/reviews";
import Listing from "@/models/listings";
import User from "@/models/user";
import { connect } from "@/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";

connect();

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { comment, rating, author, id: listingId } = reqBody;

    if (!comment || !rating || !author || !listingId) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const userInfo = await User.findById(author);
    if (!userInfo) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    const newReview = new Review({
  comment: reqBody.comment,
  rating: reqBody.rating,
  author: reqBody.author,
  likes: 0, // fallback
  likedBy: [], // fallback
});
const savedReview = await newReview.save();
console.log("Review saved:", savedReview.toObject());

    const currListing = await Listing.findById(listingId);
    if (!currListing) {
      return NextResponse.json({ message: "Listing not found" }, { status: 404 });
    }

    currListing.reviews.push(savedReview._id);
    await currListing.save();

    return NextResponse.json({
      message: "Review created successfully",
      success: true,
      savedReview,
    });
  } catch (err: any) {
    console.error("Error in POST /api/reviews/add:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
