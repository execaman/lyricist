import { get } from "axios";
import { load } from "cheerio";

export async function lyrics_com(url: string, userAgent: string) {
  const { data } = await get(url, {
    headers: {
      "User-Agent": userAgent
    }
  });

  const $ = load(data);
  const lyrics = $("pre[id=lyric-body-text]").text().trim();

  if (lyrics.length === 0) {
    throw null;
  }

  return lyrics;
}
