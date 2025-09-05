export async function getTopYouTubeVideoUrl(query: string): Promise<string> {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) throw new Error("Missing YOUTUBE_API_KEY");

    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("q", query);
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", "1");
    url.searchParams.set("order", "relevance");
    url.searchParams.set("key", apiKey);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`YouTube API error: ${res.status}`);

    const data = await res.json();
    if (!data.items || data.items.length === 0) {
      return ""; // fallback empty string if no video found
    }

    const videoId = data.items[0].id.videoId;
    return `https://www.youtube.com/watch?v=${videoId}`;
  } catch (err) {
    console.error("YouTube fetch failed:", err);
    return "";
  }
}
