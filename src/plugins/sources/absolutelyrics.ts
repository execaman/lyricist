import { get } from "axios";
import { load } from "cheerio";

export async function absolutelyrics_com(url: string, userAgent: string) {
  const { data } = await get(url, {
    headers: {
      "User-Agent": userAgent
    }
  });

  const $ = load(data);
  const lyrics = $("p[id=view_lyrics]").text().trim();

  if (lyrics.length === 0) {
    throw null;
  }

  return lyrics;
}
