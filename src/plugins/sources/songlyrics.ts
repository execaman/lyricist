import { get } from "axios";
import { load } from "cheerio";

export async function songlyrics_com(url: string, userAgent: string) {
  const { data } = await get(url, {
    headers: {
      "User-Agent": userAgent
    }
  });

  const $ = load(data);
  const lyrics = $("p[id=songLyricsDiv i]").text().trim();

  if (lyrics.length === 0) {
    throw null;
  }

  return lyrics;
}
