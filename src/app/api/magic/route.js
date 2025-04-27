// File: app/api/popads/route.js

/**
 * Next.js App Router API Route to proxy PopAds API
 *
 * This endpoint fetches the PopAds ad script from the external API
 * and returns it as JavaScript to the client.
 */

export async function GET(request) {
    try {
      // Construct the PopAds API URL
      const apiUrl = 'https://www.popads.net/api/website_code?key=d9d1f71379e757f3c2c0d88f3395f31ccc217485&website_id=5191132&tl=auto&aab=1&of=1';
  
      // Fetch the ad script from PopAds
      const res = await fetch(apiUrl);
  
      // Read the response as text
      const scriptText = await res.text();
  
      // Return the script to the client with correct MIME type
      return new Response(scriptText, {
        status: res.status,
        headers: {
          'Content-Type': 'application/javascript',
        },
      });
    } catch (error) {
      console.error('Error fetching PopAds script:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
  