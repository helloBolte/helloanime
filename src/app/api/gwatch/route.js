import axios from "axios";

export async function GET(request) {
  // Extract query parameters from the incoming request URL
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get("provider");
  const id = searchParams.get("id");
  const num = searchParams.get("num");
  const subType = searchParams.get("subType");
  const watchId = searchParams.get("watchId");
  const dub_id = searchParams.get("dub_id");

  // Construct the backend URL using the query parameters
  const backendUrl = `https://backend.gojo.wtf/api/anime/tiddies?provider=${provider}&id=${id}&num=${num}&subType=${subType}&watchId=${watchId}&dub_id=${dub_id}`;

  try {
    // Call the backend API with the required Referer header
    const response = await axios.get(backendUrl, {
      headers: {
        "Referer": "https://gojo.wtf/",
      },
    });
    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching tiddies data:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: error.response?.status || 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
