import Review from "@/models/reviews";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import axios from "axios";

connect();

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const reviewId = params.id;

  try {
    const origin = req.headers.get("origin") || "http://localhost:3000";
    const tokenRes = await axios.post(`${origin}/api/users/getTokenData`, {}, {
      headers: {
        Cookie: req.headers.get("cookie") || "",
      }
    });

    const userId = tokenRes.data.data.id;
    const review = await Review.findById(reviewId);

    if (!review) {
      return NextResponse.json({ message: "Review not found" }, { status: 404 });
    }

    // ✅ Fix: Ensure likedBy is always an array
    if (!Array.isArray(review.likedBy)) {
      review.likedBy = [];
    }

    if (review.likedBy.includes(userId)) {
      return NextResponse.json({ message: "User already liked this review" }, { status: 400 });
    }

    review.likes += 1;
    review.likedBy.push(userId);
    await review.save();

    return NextResponse.json({ message: "Like added", likes: review.likes }, { status: 200 });

  } catch (err: any) {
    console.error("Error liking review:", err);
    return NextResponse.json({ message: "Error liking review", error: err.message }, { status: 500 });
  }
}
