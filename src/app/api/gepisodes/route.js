import axios from 'axios';

export async function GET(request) {
  // Extract the 'id' query parameter from the request URL
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response(
      JSON.stringify({ error: "Missing 'id' query parameter" }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Use axios to fetch data from the external API using the provided id
    const response = await axios.get(`https://backend.gojo.wtf/api/anime/episodes/${id}`, {
      headers: {
        'Referer': 'https://gojo.wtf/',
      },
    });

    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: error.response?.status || 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
