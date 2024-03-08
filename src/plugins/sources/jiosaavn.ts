import { get } from "axios";
import { load } from "cheerio";

export async function jiosaavn_com(url: string, userAgent: string) {
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
    const lyric = $(element).text().trim();

    if (lyric.length === 0 && lyrics.length === 0) {
      throw null;
    }

    lyrics.push(lyric);
  });

  if (lyrics.length === 0) {
    throw null;
  }

  return lyrics.join("\n");
}
