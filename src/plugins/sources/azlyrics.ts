import { get } from "axios";
import { load } from "cheerio";

export async function azlyrics_com(url: string, userAgent: string) {
  try {
    const { data } = await get(url, {
      headers: {
        "User-Agent": userAgent
      }
    });

    const $ = load(data);
    const lyrics = $("div:has(div[class*=lyricsh]) > div:nth-of-type(5):first")
      .text()
      .trim();

    if (lyrics.length === 0) {
      throw null;
    }

    return lyrics;
  } catch {
    return Promise.reject();
  }
}
