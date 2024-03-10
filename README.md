## Import

```js
// ES Modules
import { Lyricist } from "@execaman/lyricist";

// Common JS
const { Lyricist } = require("@execaman/lyricist");
```

## Configure

```js
const lyrics = new Lyricist({
  // An array of async scraper functions
  // Read the last section for more info
  plugins: [],

  // Whether to save last successful
  // fetch results. default is false
  saveLastResult: false
});
```

## Usage

```js
// Keep it short, around 30
// characters in length
const query = "calma remix";

// Number of attempts to make
// if Google doesn't have the lyric
const attempt = 3;

// Make a request
const result = await lyrics.fetch(query, attempt);
```

<details>
<summary>Sample Response</summary>

```js
{
  song: { title: 'Calma', subtitle: 'Song by Farruko and Pedro Capó' },
  info: [
    { label: 'Album:', value: 'Calma' },
    { label: 'Artists:', value: 'Pedro Capó, Farruko' },
    { label: 'Released:', value: '2018' },
    {
      label: 'Awards:',
      value: 'Latin Grammy Award for Song of the Year, MORE'
    },
    { label: 'Genres:', value: 'Latin pop, Pop' }
  ],
  listen: [
    {
      source: 'Spotify',
      stream: 'https://open.spotify.com/track/7FRYMm2zVVB6lpNpDWxldE?autoplay=true'
    },
    {
      source: 'YouTube Music',
      stream: 'https://music.youtube.com/watch?v=7Eo7d5_5ktI&feature=gws_kp_track'
    },
    {
      source: 'Apple Music',
      stream: 'https://music.apple.com/in/album/calma-remix/1437920278?i=1437920364'
    },
    {
      source: 'JioSaavn',
      stream: 'https://www.jiosaavn.com/song/calma-remix/Flg8AQ1-RVc?autoplay=enabled'
    }
  ],
  lyrics: 'Cuatro abrazos y un café\n' +
    'Apenas me desperté\n' +
    'Y al mirarte recordé\n' +
    'Que ya todo lo encontré\n' +
    '\n' +
    'Tu mano en mi mano\n' +
    'De todo escapamos\n' +
    'Juntos ver el sol caer\n' +
    '\n' +
    "Vamos pa' la playa\n" +
    "Pa' curarte el alma\n" +
    'Cierra la pantalla\n' +
    'Abre la Medalla\n' +
    'Todo el mar Caribe\n' +
    'Viendo tu cintura\n' +
    'Tú le coqueteas\n' +
    'Tú eres buscabulla\n' +
    'Y me gusta\n' +
    '\n' +
    'Lento y contento, cara al viento\n' +
    'Lento y contento, cara al viento\n' +
    '\n' +
    "Pa' sentir la arena en los pies\n" +
    "Pa' que el sol nos pinte la piel\n" +
    "Pa' jugar como niños, darnos cariño\n" +
    'Como la primera vez que te miré\n' +
    'Yo supe que estaría a tus pies\n' +
    'Desde que se tocaron\n' +
    '\n' +
    'Calma, mi vida, con calma\n' +
    'Que nada hace falta si estamos juntitos bailando\n' +
    'Calma, mi vida, con calma\n' +
    'Que nada hace falta si estamos juntitos andando\n' +
    'Calma, mi vida, con calma\n' +
    'Que nada hace falta si estamos juntitos bailando',
  source: {
    name: 'google.com',
    url: 'https://www.google.com/search?q=calma%20remix%20lyrics'
  }
}
```

</details>

## How it works

It fetches the [SERP](https://en.wikipedia.org/wiki/Search_engine_results_page) after appending " lyrics" to the query from Google, looks for any showcased lyrics and resolves it if available; else, tries to find a result on page that it has a supported plugin for.

### This solves two major problems:

- Spam or sending unwanted traffic to a specific site
- And in turn, being timed out, rate-limited, or even blaclisted

> Note: there is a 3s delay to prevent you from spamming Google, but other sites might require a higher delay (in case there are no lyrics on page); so make sure to not make any unnecessary requests.

### What are plugins?

- Plugins are async functions that scrape direct lyric-page URLs
- They have two parameters, first: the URL, second: A random User-Agent string
- The function name represents the [hostname](https://nodejs.org/api/url.html#urlhostname) of the site
- Underscore (`_`) in function names define the hostname of the site
- Two underscores resemble a hyphen (`-`), while one resembles a dot (`.`)

So a function name like `karaoke__lyrics_com` would translate to `karaoke-lyrics.com`

## Writing your own plugin

<p>To write one yourself, you must know how it should behave:</p>

- Use try-catch blocks, avoid [`throw`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Statements/throw)ing anything
- Make sure to choose a site that has a good [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction) structure
- Avoid hostname conflicts (e.g. abc.com <=> abc.com.br)
- Avoid sites that include content other than lyrics and yet appear on Google
- Either return lyrics, or [reject](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/reject) as soon as you realise the result could be invalid

### Resources

- [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) - MDN
- [Axios](https://axios-http.com/docs/intro) - Docs
- [Cheerio](https://cheerio.js.org/docs/basics/selecting) - Selecting Elements

### References

- [lyria-npm](https://www.npmjs.com/package/lyria-npm)
- [@youka/lyrics](https://www.npmjs.com/package/@youka/lyrics)

## Conclusion

With AI and modern frontend frameworks, [sources](./src/plugins/index.ts) would eventually become unscrapable. Therefore, I do not guarantee its functionality over time or if this package will be up-to-date. This is NOT an ethical way of obtaining lyrics anyway.
