import { get } from "axios";
import { load } from "cheerio";

export async function saregama_com(url: string, userAgent: string) {
  const { data } = await get(url, {
    headers: {
      "User-Agent": userAgent
    }
  });

  const $ = load(data);
  const lyrics = $(
    "div[class*=songsContainer i]:first div[class*=songLyricsBox i]:last > p:first"
  )
    .text()
    .trim();

  if (lyrics.length === 0) {
    throw null;
  }

  return lyrics;
}
