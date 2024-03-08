## How it works

It fetches the [SERP](https://en.wikipedia.org/wiki/Search_engine_results_page) after appending " lyrics" to the query from google, looks for any showcased lyrics and resolves it if available; else, tries to find a result on page that it has a supported plugin for.

### This solves two major problems:

- Spam or sending unwanted traffic to a specific site
- And in turn, being timed out, rate-limited, or even blaclisted

> Note: there is a 3s delay to prevent you from spamming google, but other sites might require a higher delay (in case there are no lyrics on page); so make sure to not make any unnecessary requests.

### What are plugins?

- Plugins are async functions that scrape direct lyric-page URLs
- They have two parameters, first: the URL, second: A random User-Agent string
- The function name represents the domain name of the site
- Underscore (`_`) in function names define the domain name of the site
- Two underscores resemble a hyphen (`-`), while one resembles a dot (`.`)

So a function name like `karaoke__lyrics_com` would translate to `karaoke-lyrics.com`

## Writing your own plugin

<p>To write one yourself, you must know how it should behave:</p>

- Do not use try-catch blocks, keep it simple
- `throw` anything or reject as you know the result would eventually be invalid

### Resources

- [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) - MDN
- [Axios](https://axios-http.com/docs/intro) - Docs
- [Cheerio](https://cheerio.js.org/docs/basics/selecting) - Selecting Elements

### References

- [lyria-npm](https://www.npmjs.com/package/lyria-npm)
- [@youka/lyrics](https://www.npmjs.com/package/@youka/lyrics)
