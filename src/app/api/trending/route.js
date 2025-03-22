import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("anitest");
    const collection = db.collection("trendingAnime");

    // Retrieve all documents from the trendingAnime collection
    const data = await collection.find({}).toArray();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching trendingAnime data from database:", error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}
