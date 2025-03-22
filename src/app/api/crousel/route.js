// app/api/crousel/route.js
import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

export async function GET(request) {
  try {
    // Connect to MongoDB using the client promise.
    const client = await clientPromise;
    const db = client.db('anitest');
    const collection = db.collection('crousel');

    // Retrieve all documents from the crousel collection.
    const data = await collection.find({}).toArray();

    // Return the collection as JSON.
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching crousel data from database:', error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}
