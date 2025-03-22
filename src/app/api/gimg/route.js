import axios from "axios";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return new Response(
      JSON.stringify({ error: "Missing url parameter" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const response = await axios.get(imageUrl, {
      headers: {
        "Referer": "https://gojo.wtf/",
      },
      responseType: "arraybuffer",
    });

    return new Response(response.data, {
      status: 200,
      headers: {
        "Content-Type": response.headers["content-type"] || "image/jpeg",
      },
    });
  } catch (error) {
    console.error("Error fetching image:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: error.response?.status || 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
