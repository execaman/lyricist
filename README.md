## Usage

```js
import { Lyricist } from "@execaman/lyricist"; // ESM
const { Lyricist } = require("@execaman/lyricist"); // CJS

const lyrics = new Lyricist();

lyrics.fetch("calma remix").then(console.log).catch(console.error);
```

### Fetch parameters:

1). `query` (string) - no need to write "lyrics" at the end<br>
2). `attempt` (number) - number of results to attempt and scrape if google doesn't have the lyrics

<details>
<summary>Sample Response</summary>

```js
{
  meta: [
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
    'Tu mano y mi mano\n' +
    'Y de todo escapamos\n' +
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
    'Calma, mi vida, con calma\n' +
    'Que nada hace falta si estamos juntitos andando\n' +
    'Calma, mi vida, con calma\n' +
    'Que nada hace falta si estamos juntitos bailando\n' +
    'Calma, mi vida, con calma\n' +
    'Que nada hace falta si estamos juntitos andando\n' +
    'Calma, mi vida, con calma\n' +
    'Que nada hace falta si estamos juntitos bailando',
  source: {
    name: 'google',
    url: 'https://www.google.com/search?q=calma%20remix%20lyrics'
  }
}
```

</details>

## How it works

It fetches the [SERP](https://en.wikipedia.org/wiki/Search_engine_results_page) after appending " lyrics" to the query from google, looks for any showcased lyrics and resolves it if available; else, tries to find a result on page that it has a supported plugin for.

### This solves two major problems:

- Spam or sending unwanted traffic to a specific site
- And in turn, being timed out, rate-limited, or even blaclisted

> Note: there is a 3s delay to prevent you from spamming google, but other sites might require a higher delay (in case there are no lyrics on page); so make sure to not make any unnecessary requests.

### What are plugins?

- Plugins are async functions that scrape direct lyric-page URLs
- They have two parameters, first: the URL, second: A random User-Agent string
- The function name represents the [hostname](https://nodejs.org/api/url.html#urlhostname) of the site
- Underscore (`_`) in function names define the domain name of the site
- Two underscores resemble a hyphen (`-`), while one resembles a dot (`.`)

So a function name like `karaoke__lyrics_com` would translate to `karaoke-lyrics.com`

## Writing your own plugin

<p>To write one yourself, you must know how it should behave:</p>

- Do not use try-catch blocks, keep it simple
- reject or `throw` anything as soon as you realise the result could be invalid

### Resources

- [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) - MDN
- [Axios](https://axios-http.com/docs/intro) - Docs
- [Cheerio](https://cheerio.js.org/docs/basics/selecting) - Selecting Elements

### References

- [lyria-npm](https://www.npmjs.com/package/lyria-npm)
- [@youka/lyrics](https://www.npmjs.com/package/@youka/lyrics)
