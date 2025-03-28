import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

export async function GET(request) {
  try {
    // Extract the anilistId from the query parameters
    const { searchParams } = new URL(request.url);
    const anilistIdParam = searchParams.get("anilistId");

    if (!anilistIdParam) {
      return NextResponse.json(
        { error: "anilistId query parameter is required" },
        { status: 400 }
      );
    }

    // Convert the anilistId to a number (adjust if your id is stored as a string)
    const anilistId = Number(anilistIdParam);

    const client = await clientPromise;
    const db = client.db("anitest");
    const collection = db.collection("animes");

    // Check for the document with the provided anilistId in the "id" field
    const document = await collection.findOne({ id: anilistId });

    if (!document) {
      return NextResponse.json({ available: false });
    }

    return NextResponse.json({ available: true });
  } catch (error) {
    console.error("Error fetching anime data from database:", error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}
