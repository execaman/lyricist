import { get } from "axios";
import { load } from "cheerio";

export async function karaoke__lyrics_net(url: string, userAgent: string) {
  const { data } = await get(url, {
    headers: {
      "User-Agent": userAgent
    }
  });

  const $ = load(data);
  const lyrics: string[] = [];

  $("div[id=content] div[class*=lyrics_cont] > div[class*=para_row]").each(
    (index, element) => {
      lyrics.push($(element).text().trim());
    }
  );

  if (lyrics.length === 0) {
    throw null;
  }

  return lyrics.join("\n\n");
}
