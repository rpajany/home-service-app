import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Review from "@/models/Review";

function serializeReview(review) {
  return {
    _id: review?._id ? String(review._id) : "",
    name: String(review?.name || ""),
    area: String(review?.area || ""),
    rating: Number(review?.rating || 0),
    review: String(review?.review || ""),
    createdAt: review?.createdAt
      ? new Date(review.createdAt).toISOString()
      : null,
  };
}

export async function GET() {
  try {
    await connectDB();

    const reviews = await Review.find({ approved: true })
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();

    return NextResponse.json({
      reviews: reviews.map(serializeReview),
    });
  } catch (error) {
    console.error("REVIEWS_GET_ERROR", error);
    return NextResponse.json(
      { error: "Unable to load customer reviews.", reviews: [] },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    const name = String(body?.name || "").trim();
    const area = String(body?.area || "").trim();
    const reviewText = String(body?.review || "").trim();
    const rating = Number(body?.rating);

    if (!name || !area || !reviewText || !rating) {
      return NextResponse.json(
        { error: "Name, area, rating and review are required." },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: "Name must be 100 characters or less." },
        { status: 400 }
      );
    }

    if (area.length > 120) {
      return NextResponse.json(
        { error: "Area must be 120 characters or less." },
        { status: 400 }
      );
    }

    if (reviewText.length > 400) {
      return NextResponse.json(
        { error: "Review must be 400 characters or less." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5." },
        { status: 400 }
      );
    }

    await connectDB();

    const created = await Review.create({
      name,
      area,
      rating,
      review: reviewText,
      approved: true,
    });

    return NextResponse.json(
      { review: serializeReview(created) },
      { status: 201 }
    );
  } catch (error) {
    console.error("REVIEWS_POST_ERROR", error);
    return NextResponse.json(
      { error: "Unable to save your review." },
      { status: 500 }
    );
  }
}
