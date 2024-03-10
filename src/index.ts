import { get } from "axios";
import UserAgent from "user-agents";
import { load } from "cheerio";
import { URL } from "node:url";
import * as built_in_plugins from "./plugins";

export type LyricScraper = (url: string, userAgent: string) => Promise<string>;

/** Options to configure {@link Lyricist} */
export interface LyricOptions {
  /** An array of async scraper functions. [learn more](https://github.com/execaman/lyricist?tab=readme-ov-file#writing-your-own-plugin) */
  plugins?: LyricScraper[];
  /** Whether to save last successful fetch result */
  saveLastResult?: boolean;
}

/** An object of the platform that streams this song */
export interface LyricStream {
  /** Name of the platform that streams this song */
  source: string;
  /** Direct URL to the song on this platform */
  stream: string;
}

/** Additional info on the song based on SERP */
export interface LyricInfo {
  /** Label of a info field */
  label: string;
  /** Value of that info field */
  value: string;
}

/** Source of the lyrics provider */
export interface LyricSource {
  /** Name of the source of this lyric */
  name: string;
  /** A URL to the source of this lyric */
  url: string;
}

/** A successful fetch result */
export interface LyricResult {
  song?: {
    title: string;
    subtitle: string;
  };
  info?: LyricInfo[];
  listen?: LyricStream[];
  lyrics: string;
  source: LyricSource;
}

export class Lyricist {
  /** A map of all available plugins */
  plugins = new Map<string, LyricScraper>();

  #saveLastResult?: boolean;
  #lastCall?: number;

  /** Last successful fetch result if {@link LyricOptions.saveLastResult} was enabled */
  lastResult?: LyricResult;

  #randomUserAgent = new UserAgent({ deviceCategory: "desktop" }).random;

  constructor(options?: LyricOptions) {
    const plugins: LyricScraper[] = Object.values(built_in_plugins);

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

    if (options?.saveLastResult) {
      this.#saveLastResult = true;
    }
  }

  /**
   * Fetch a lyric by query; minimum recommended delay: 3s
   * @param query Name of the song or full query
   * @param attempt Number of attempts to make if Google doesn't have the lyric
   * @returns {Promise<LyricResult>}
   */
  async fetch(query: string, attempt?: number): Promise<LyricResult> {
    if (
      typeof this.#lastCall === "number" &&
      Date.now() - this.#lastCall <= 3_000
    ) {
      throw new Error("Spam. You should delay every request by atleast 3s");
    }

    this.#lastCall = Date.now();

    const queryUrl = `https://www.google.com/search?q=${encodeURIComponent(
      query.concat(" lyrics")
    )}`;

    const userAgent = this.#randomUserAgent().toString();

    const { data } = await get(queryUrl, {
      headers: {
        "User-Agent": userAgent
      }
    });

    const $ = load(data);

    const searchResult = {} as LyricResult;

    // title & subtitle
    {
      const title = $("div[data-attrid=title]").text().trim();

      const subtitle = $("div[data-attrid=subtitle]").text().trim();

      if (title.length !== 0 && subtitle.length !== 0) {
        searchResult.song = { title, subtitle };
      }
    }

    // info
    {
      const info: LyricInfo[] = [];

      $("div[id=rhs] div[data-attrid*=music]").each((i, div) => {
        const label = $(div).find("span:first").text().trim();

        const value = $(div).find("span:nth-of-type(2):first").text().trim();

        if (label.length !== 0 && value.length !== 0) {
          info.push({ label, value });
        }
      });

      if (info.length !== 0) {
        searchResult.info = info;
      }
    }

    // listen
    {
      const listen: LyricStream[] = [];

      $("div[data-attrid*=action:listen] a:has(div)").each((i, link) => {
        const source = $(link)
          .find("div:first > div:nth-of-type(2)")
          .text()
          .trim();

        const stream = $(link).attr("href") as string;

        if (source.length !== 0) {
          listen.push({ source, stream });
        }
      });

      if (listen.length !== 0) {
        searchResult.listen = listen;
      }
    }

    // lyrics
    {
      const lyrics: string[] = [];

      $(
        "div[data-lyricid] > div:first > div:nth-of-type(2) > div:has(span)"
      ).each((i, div) => {
        let lyric = "";

        $(div)
          .find("span")
          .each((j, span) => {
            lyric += $(span).text().trim().concat("\n");
          });

        lyrics.push(lyric);
      });

      if (lyrics.length !== 0) {
        searchResult.lyrics = lyrics.join("\n").trimEnd();

        searchResult.source = {
          name: "google.com",
          url: queryUrl
        };

        if (this.#saveLastResult) {
          this.lastResult = searchResult;
        }

        return searchResult;
      }
    }

    // fallback attempts
    const results: LyricSource[] = [];

    const plugins = [...this.plugins.keys()];

    $("div[data-async-context^=query:] div[data-snc] div > span > a").each(
      (i, link) => {
        const url = new URL($(link).attr("href") as string);

        if (url.pathname.length <= 1) {
          return;
        }

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
      }
    );

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
          },
          source: result.source
        }
      });
    }

    searchResult.lyrics = result.lyrics;
    searchResult.source = result.source;

    if (this.#saveLastResult) {
      this.lastResult = searchResult;
    }

    return searchResult;
  }
}
