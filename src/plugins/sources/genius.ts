import { get } from "axios";
import { load } from "cheerio";

export async function genius_com(url: string, userAgent: string) {
  try {
    const { data } = await get(url, {
      headers: {
        "X-Genius-iOS-Version": "6.0.6",
        "User-Agent": "Genius/825 CFNetwork/1121.2.2 Darwin/19.2.0"
      }
    });

    const $ = load(data);
    const lyrics: string[] = [];

    $("div[data-lyrics-container]").each((index, element) => {
      const html = $(element).html()?.replace(/<br>/g, "\n");

      if (typeof html !== "string") {
        throw null;
      }

      const lyric = load(html).text().trim();

      if (lyric.length === 0) {
        throw null;
      }

      lyrics.push(lyric);
    });

    if (lyrics.length === 0) {
      throw null;
    }

    return lyrics.join("\n\n");
  } catch {
    return Promise.reject();
  }
}
