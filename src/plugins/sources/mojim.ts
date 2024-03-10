import { get } from "axios";
import { load } from "cheerio";

export async function mojim_com(url: string, userAgent: string) {
  try {
    const { data } = await get(url, {
      headers: {
        "User-Agent": userAgent
      }
    });

    const $ = load(data);

    const html = $(
      "div[id=frame] > div:has(table) > table td table td > div dd"
    )
      .html()
      ?.replace(/<br>/g, "\n");

    if (typeof html !== "string" || html.length === 0) {
      throw null;
    }

    const lyrics = $(html).text().trim();

    if (lyrics.length === 0) {
      throw null;
    }

    return lyrics;
  } catch {
    return Promise.reject();
  }
}
