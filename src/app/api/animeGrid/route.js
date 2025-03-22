/* eslint-disable no-console */
import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

export async function GET() {
    try {
      const client = await clientPromise;
      const db = client.db("anitest");
      const collection = db.collection("animegrid");
  
      // Retrieve all documents from the animegrid collection.
      const data = await collection.find({}).toArray();
  
      // Return the entire collection as JSON.
      return NextResponse.json(data);
    } catch (error) {
      console.error("Error fetching animegrid data from database:", error);
      return NextResponse.json(
        { error: `Internal Server Error: ${error.message}` },
        { status: 500 }
      );
    }
  }