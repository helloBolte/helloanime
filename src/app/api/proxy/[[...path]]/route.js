import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get("url");
    if (!targetUrl) {
      return NextResponse.json({ error: "Missing target URL parameter" }, { status: 400 });
    }

    const headers = {
      "User-Agent": "Mozilla/5.0",
      Accept: "*/*",
      Referer: "https://megacloud.tv/",
      Origin: "https://megacloud.tv/",
    };

    const response = await axios.get(decodeURIComponent(targetUrl), {
      headers,
      responseType: "arraybuffer",
      validateStatus: () => true,
    });

    const resHeaders = new Headers();
    Object.entries(response.headers).forEach(([key, value]) => {
      resHeaders.set(key, value);
    });

    resHeaders.set("Access-Control-Allow-Origin", "*");
    resHeaders.set("Access-Control-Allow-Headers", "*");
    resHeaders.set("Access-Control-Expose-Headers", "*");
    resHeaders.set("Content-Type", axiosResponse.headers["content-type"] || "application/octet-stream");

    const contentType = response.headers["content-type"] || "";
    const isManifest =
      contentType.includes("application/vnd.apple.mpegurl") ||
      contentType.includes("application/x-mpegurl") ||
      targetUrl.toLowerCase().endsWith(".m3u8") ||
      Buffer.from(response.data).toString().startsWith("#EXTM3U");

    if (isManifest) {
      const baseUrl = new URL(targetUrl).origin;
      const proxyBase = new URL(request.url).origin;
      const manifestData = Buffer.from(response.data)
        .toString()
        .split("\n")
        .map(line => {
          line = line.trim();
          if (!line || line.startsWith("#")) return line;
          if (line.startsWith("http")) {
            return `${proxyBase}/api/proxy?url=${encodeURIComponent(line)}`;
          }
          return `${proxyBase}/api/proxy?url=${encodeURIComponent(
            new URL(line, baseUrl).href
          )}`;
        })
        .join("\n");

      return new Response(manifestData, {
        status: response.status,
        headers: resHeaders,
      });
    }

    return new Response(response.data, {
      status: response.status,
      headers: resHeaders,
    });

  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";