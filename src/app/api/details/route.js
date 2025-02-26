// app/api/anilist/route.js
import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const anilistId = searchParams.get('anilistId');

  if (!anilistId) {
    return NextResponse.json(
      { error: 'Missing anilistId parameter' },
      { status: 400 }
    );
  }

  try {
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'helloanime');
    const collection = db.collection('animes');

    // Query the document using a string value for anilist_id.
    const data = await collection.findOne({ anilist_id: Number(anilistId) });
    console.log("Database Response:", data);

    if (!data) {
      return NextResponse.json(
        { error: `No data found for anilistId ${anilistId}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      directory_name: data.directory_name,
      episode_data: data.episode_data,
    });
  } catch (error) {
    console.error('Error connecting to database or fetching data:', error);
    // Return the error message if unable to connect to the database.
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}
