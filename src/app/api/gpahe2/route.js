// app/api/proxy/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

// Handle preflight requests
export async function OPTIONS(request) {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(request) {
  // Extract the "url" query parameter from the incoming request.
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  try {
    // Fetch the file with axios as an arraybuffer (to preserve binary data).
    const response = await axios.get(targetUrl, {
      responseType: 'arraybuffer',
      headers: {
        'Origin': 'https://gojo.wtf',
        'Referer': 'https://gojo.wtf',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
          'AppleWebKit/537.36 (KHTML, like Gecko) ' +
          'Chrome/115.0.0.0 Safari/537.36',
        'Accept': '*/*',
      },
    });

    // Create a new Headers object and copy over relevant headers.
    const headers = new Headers();
    if (response.headers['content-type']) {
      headers.set('Content-Type', response.headers['content-type']);
    }
    if (response.headers['content-length']) {
      headers.set('Content-Length', response.headers['content-length']);
    }
    // Set CORS headers on the response.
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return new NextResponse(response.data, {
      status: response.status,
      headers,
    });
  } catch (error) {
    console.error("Proxy API error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
