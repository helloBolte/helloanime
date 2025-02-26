import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const directory_name = searchParams.get('directory_name');
  const ep_id = searchParams.get('ep_id');

  // Validate the required query parameters.
  if (!directory_name || !ep_id) {
    return NextResponse.json(
      { error: 'Missing directory_name or ep_id parameter' },
      { status: 400 }
    );
  }

  try {
    // Connect to MongoDB and select the correct database.
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB); // e.g., 'helloanime'
    const collection = db.collection('episodes');

    // Retrieve the document for the given directory_name.
    const document = await collection.findOne({ directory_name });
    if (!document) {
      return NextResponse.json(
        { error: `No episode document found for directory_name "${directory_name}"` },
        { status: 404 }
      );
    }

    // Search for the episode in the "sub" and "dub" arrays.
    const subEpisode = document.sub
      ? document.sub.find((ep) => String(ep.ep_id) === String(ep_id))
      : null;
    const dubEpisode = document.dub
      ? document.dub.find((ep) => String(ep.ep_id) === String(ep_id))
      : null;

    // If neither version is found, return a 404 error.
    if (!subEpisode && !dubEpisode) {
      return NextResponse.json(
        { error: `No episode found for ep_id "${ep_id}" in directory "${directory_name}"` },
        { status: 404 }
      );
    }

    // Return the m3u8, subtitle, intro, and outro for both sub and dub.
    return NextResponse.json(
      {
        sub: subEpisode
          ? {
              m3u8: subEpisode.m3u8,
              subtitle: subEpisode.subtitle,
              intro: subEpisode.intro,
              outro: subEpisode.outro,
            }
          : null,
        dub: dubEpisode
          ? {
              m3u8: dubEpisode.m3u8,
              subtitle: dubEpisode.subtitle,
              intro: dubEpisode.intro,
              outro: dubEpisode.outro,
            }
          : null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching episode:', error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}