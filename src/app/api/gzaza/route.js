// app/api/proxy/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request) {
  // Extract the "url" query parameter from the incoming request
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  try {
    // Fetch the file with axios as an arraybuffer (binary data)
    const response = await axios.get(targetUrl, {
      responseType: 'arraybuffer',
      headers: {
        'Referer': 'https://gojo.wtf/',
      },
    });

    // Create a new Headers object and copy the relevant headers from the response
    const headers = new Headers();
    if (response.headers['content-type']) {
      headers.set('Content-Type', response.headers['content-type']);
    }
    if (response.headers['content-length']) {
      headers.set('Content-Length', response.headers['content-length']);
    }
    
    // Return the raw data as is, preserving file integrity
    return new NextResponse(response.data, {
      status: response.status,
      headers,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
