import { get } from "axios";
import { load } from "cheerio";

export async function jiosaavn_com(url: string, userAgent: string) {
  try {
    const { data } = await get(url, {
      headers: {
        "User-Agent": userAgent
      }
    });

    const $ = load(data);
    const lyrics: string[] = [];

    $(
      "main > div:nth-of-type(3) > section:first > div:first > p:first > span"
    ).each((index, element) => {
      lyrics.push($(element).text().trim());
    });

    if (lyrics.length === 0) {
      throw null;
    }

    return lyrics.join("\n");
  } catch {
    return Promise.reject();
  }
}
