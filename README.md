# Waifu PWA
Waifu is a Progressive Web Application I made in order to learn new stuff, PWAs obviously, and without expectation it became a leisure companion for me and my pal Antonio, as it enables us to watch video content, mostly anime (here THE name), in a simple way and without data sucking ads.

Waifu is far from being perfect, indeed it's swear friendly, especially while streaming to Chrome Cast devices, but it still casts and plays better than your bloated video caster full of advertisements, and works flawlessy by its own.

## These are Waifu's current features:
- A barebone playlist manager.
- Playlist are shareable, in the sense you can create, modify and then download, web share api sucks.
- A complete video player.
- Chrome Cast support ( Chrome and Chromium only )
- Mobile friendly interface
- Installable, yet not much of use, it works offline, but sadly I didn't have much success in prefetching selectively, so real usage offline.
- **HLS** should work, as far the source playlist's conform and the http request returns its correct mimetype... and of course browser must support, too lazy do add hls.js right now. Needs testing for chromecast devices, works on chrome for Android.
- _Scraper friendly_

## Sample playlist

[This is a sample playlist](https://gist.github.com/marcospampi/3bec49ee46712ee8aa4da9b0b4491e90) with three awesome short movies made by the Blender Project

## Skip video prefetch
If you build this project, be sure to append this in ngsw-worker.js under  onFetch() callback once built, sadly, angular service worker is ridiculously hard to configure, and by default prefetches even kebabs, and we do not want kebabs.

```js
 if( req.url.match(/\.(mp4|m4a|m4p|m4b|m4r|m4v|mkv|m3u8|m3u|webm|ts)$/))
     return;
```

## Antonio swears
> Antonio: Waifu isn't loading, it crashed with the chromecast!
> Me: Tell that to the programmer
> Antonio: You made it, WTF

# Boring stuff

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 10.1.6.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).


