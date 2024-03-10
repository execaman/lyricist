import { get } from "axios";
import { load } from "cheerio";

export async function paroles__musique_com(url: string, userAgent: string) {
  try {
    const { data } = await get(url, {
      headers: {
        "User-Agent": userAgent
      }
    });

    const $ = load(data);
    const lyrics = $("div[id=lyrics] > div:first").text().trim();

    if (lyrics.length === 0) {
      throw null;
    }

    return lyrics;
  } catch {
    return Promise.reject();
  }
}
