import { get } from "axios";
import { load } from "cheerio";

export async function kkbox_com(url: string, userAgent: string) {
  const { data } = await get(url, {
    headers: {
      "User-Agent": userAgent
    }
  });

  const $ = load(data);
  const lyrics = $("div[class*=lyrics] > p:nth-of-type(2):first").text().trim();

  if (lyrics.length === 0) {
    throw null;
  }

  return lyrics;
}
