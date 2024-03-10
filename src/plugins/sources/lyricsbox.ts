import { get } from "axios";
import { load } from "cheerio";

export async function lyricsbox_com(url: string, userAgent: string) {
  try {
    const { data } = await get(url, {
      headers: {
        "User-Agent": userAgent
      }
    });

    const $ = load(data);
    const lyrics: string[] = [];

    $("div[id=lyrics] > div[class*=lyrics_part_text]").each(
      (index, element) => {
        lyrics.push($(element).text());
      }
    );

    if (lyrics.length === 0) {
      throw null;
    }

    return lyrics.join("\n\n");
  } catch {
    return Promise.reject();
  }
}
