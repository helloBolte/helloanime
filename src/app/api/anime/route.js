// app/api/anime/route.js
import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

export async function GET(request) {
  // Extract query parameters from the request URL.
  const { searchParams } = new URL(request.url);
  const animeId = searchParams.get('id');

  if (!animeId) {
    return NextResponse.json(
      { error: 'Missing id parameter' },
      { status: 400 }
    );
  }

  try {
    // Connect to MongoDB using the client promise.
    const client = await clientPromise;
    const db = client.db('anitest');
    const collection = db.collection('animes');

    // Query the document using the 'id' field stored in the database.
    const data = await collection.findOne({ id: Number(animeId) });

    if (!data) {
      return NextResponse.json(
        { error: `No anime found with id ${animeId}` },
        { status: 404 }
      );
    }

    // Return the whole document (or select fields as needed).
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching data from database:', error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}
