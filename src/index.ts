import { get } from "axios";
import UserAgent from "user-agents";
import { load, type Element } from "cheerio";
import { URL } from "node:url";
import * as built_in_plugins from "./plugins";

export type LyricScraper = (url: string, userAgent: string) => Promise<string>;

export interface LyricOptions {
  plugins?: LyricScraper[];
}

export interface LyricStream {
  source: string;
  stream: string;
}

export interface LyricInfo {
  label: string;
  value: string;
}

export interface LyricSource {
  name: string;
  url: string;
}

export interface LyricResult {
  meta?: LyricInfo[];
  listen?: LyricStream[];
  lyrics: string;
  source: LyricSource;
}

export class Lyricist {
  plugins = new Map<string, LyricScraper>();

  lastCall?: number;
  randomUserAgent = new UserAgent({ deviceCategory: "desktop" }).random;

  constructor(options?: LyricOptions) {
    const plugins = Object.values(built_in_plugins);

    if (options?.plugins) {
      if (!Array.isArray(options.plugins)) {
        throw new TypeError("Expected plugins to be an array");
      }
      plugins.push(...options.plugins);
    }

    for (const plugin of plugins) {
      if (
        typeof plugin !== "function" ||
        plugin.constructor.name !== "AsyncFunction"
      ) {
        throw new TypeError("Expected plugin to be an async function");
      }

      this.plugins.set(
        plugin.name.replace(/__/g, "-").replace(/_/g, "."),
        plugin
      );
    }
  }

  async fetch(query: string, attempt?: number) {
    if (
      typeof this.lastCall === "number" &&
      Date.now() - this.lastCall <= 3_000
    ) {
      throw new Error("Spam. You should delay every request by atleast 3s");
    }

    const queryUrl = `https://www.google.com/search?q=${encodeURIComponent(
      query.concat(" lyrics")
    )}`;

    const userAgent = this.randomUserAgent().toString();

    const { data } = await get(queryUrl, {
      headers: {
        "User-Agent": userAgent
      }
    });

    this.lastCall = Date.now();

    const $ = load(data);

    const searchResult = {} as LyricResult;

    // Meta
    const meta: LyricInfo[] = [];

    const extractInfo = (index: number, element: Element) => {
      const info = $(element);

      const label = info.find("span:first").text().trim();
      if (label.length === 0) return;

      const value = info.find("span:nth-of-type(2):first").text().trim();
      if (value.length === 0) return;

      meta.push({ label, value });
    };

    $(`div[aria-label*=About i] div[data-attrid*=music]:has(span)`).each(
      extractInfo
    );

    if (meta.length !== 0) {
      searchResult.meta = meta;
    }

    // Listen
    const listen: LyricStream[] = [];

    $("div[data-attrid*=action:listen] a:has(div)").each((index, element) => {
      const source = $(element);

      const sourcName = source
        .find("div > div:nth-of-type(2):first > div:first")
        .text()
        .trim();
      if (sourcName.length === 0) return;

      const sourceUrl = source.attr("href");
      if (typeof sourceUrl !== "string") return;

      listen.push({
        source: sourcName,
        stream: sourceUrl
      });
    });

    if (listen.length !== 0) {
      searchResult.listen = listen;
    }

    // Lyrics
    const lyrics: string[] = [];

    $("div[data-lyricid] > div > div:nth-of-type(2) > div:has(span)").each(
      (index, element) => {
        let note = "";

        $(element)
          .find("span")
          .each((i, el) => {
            note += $(el).text().trim().concat("\n");
          });

        lyrics.push(note);
      }
    );

    if (lyrics.length !== 0) {
      searchResult.lyrics = lyrics.join("\n").trim();
    }

    if (
      typeof searchResult.lyrics === "string" &&
      searchResult.lyrics.length !== 0
    ) {
      searchResult.source = {
        name: "google",
        url: queryUrl
      };
      return searchResult;
    }

    // Other Results (Fallback Attempts)
    const results: LyricSource[] = [];

    const plugins = [...this.plugins.keys()];

    $("[data-async-context*=query:] div > span > a").each((index, element) => {
      const result = $(element).attr("href") as string;

      const url = new URL(result);
      if (url.pathname.length <= 1) return;

      for (const name of plugins) {
        if (url.hostname.includes(name)) {
          results.push({
            name: name,
            url: url.href
          });
          plugins.splice(plugins.indexOf(name), 1);
          return;
        }
      }
    });

    if (results.length === 0) {
      throw new Error(
        "No supported plugin(s) found for any of the fallback result(s)"
      );
    }

    let limit = results.length;

    if (
      typeof attempt === "number" &&
      Number.isInteger(attempt) &&
      attempt >= 0
    ) {
      limit = attempt;
    }

    const result = await Promise.any(
      results.slice(0, limit).map((query) =>
        this.plugins.get(query.name)!(query.url, userAgent).then((data) => ({
          lyrics: data,
          source: query
        }))
      )
    );

    // the check below is to ensure that
    // no plugin resolves something invalid

    if (typeof result.lyrics !== "string" || result.lyrics.length === 0) {
      throw new Error("One of the plugins resolved an unexpected value", {
        cause: {
          value: {
            type: typeof result.lyrics,
            name: result.lyrics?.constructor?.name
          }
        }
      });
    }

    searchResult.lyrics = result.lyrics;
    searchResult.source = result.source;

    return searchResult;
  }
}
