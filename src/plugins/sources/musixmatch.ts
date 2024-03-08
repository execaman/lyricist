import { get } from "axios";
import { load } from "cheerio";

export async function musixmatch_com(url: string, userAgent: string) {
  const { data } = await get(url, {
    headers: {
      "User-Agent": userAgent
    }
  });

  const $ = load(data);
  const lyrics: string[] = [];

  const writer = /writer\(s\):/gi;

  $("div:has(h2:icontains(lyrics)):last > div").each((index, element) => {
    if (writer.test($(element).text())) {
      return false;
    }

    const tag = $(element).find("h3:first").text().trim();

    if (tag.length !== 0) {
      let lyric = `[${tag}]\n`;

      element.children.shift();

      $(element)
        .find("div[dir=auto]")
        .each((i, el) => {
          lyric += $(el).text().trim().concat("\n");
        });

      if (lyric.length - tag.length === 3) {
        throw null;
      }

      lyrics.push(lyric);
    } else {
      element.children.forEach((child) => {
        let lyric = "";

        $(child)
          .find("div[dir=auto]")
          .each((i, el) => {
            lyric += $(el).text().trim().concat("\n");
          });

        lyrics.push(lyric);
      });
    }
  });

  if (lyrics.length === 0) {
    throw null;
  }

  return lyrics.join("\n");
}
