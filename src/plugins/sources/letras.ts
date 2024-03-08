import { get } from "axios";
import { load } from "cheerio";

export async function letras_com(url: string, userAgent: string) {
  const { data } = await get(url, {
    headers: {
      "User-Agent": userAgent
    }
  });

  const $ = load(data);
  const lyrics: string[] = [];

  $("div[id=js-lyric-content] div[class*=lyric-original]:first > p").each(
    (index, element) => {
      const html = $(element).html()?.replace(/<br>/g, "\n");

      if (typeof html !== "string") {
        throw null;
      }

      const lyric = load(html).text().trim();

      if (lyric.length === 0 && lyrics.length === 0) {
        throw null;
      }

      lyrics.push(lyric.concat("\n"));
    }
  );

  if (lyrics.length === 0) {
    throw null;
  }

  return lyrics.join("\n").trimEnd();
}
