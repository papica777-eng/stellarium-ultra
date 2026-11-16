# Stellarium Ultra

Real-time WebGL2 & ERFA WebAssembly astronomy observatory powered by the compiled **Stellarium Web Engine** (`C / C++ / ERFA / NanoVG / WebGL2`), styled with modular **SCSS** (`_tokens.scss`, `_mixins.scss`, `stellarium-ultra.scss`), and expanded with pure browser-native observatory instrumentation:

- **Compiled C/WASM Sky Core (`engine/stellarium-web-engine.wasm`)**: Stars, Milky Way HiPS, Preetham atmospheric scattering, Guereins horizon panorama, Western & Belarusian sky cultures with Johan Meuris constellation artwork, DSOs, Minor Planets, Comets, and TLE satellites.
- **24-Hour Planetary Visibility Timeline**: Native `SweObj.computeVisibility()` & live solar elevation curve across Sun, Moon, Mercury, Venus, Mars, Jupiter, and Saturn.
- **60-Day ERFA Astronomical Calendar**: Non-blocking `stel.calendar` ephemeris for conjunctions, oppositions, and lunar phases with instant time-jump + camera slew.
- **Telescope Eyepiece & Optical Field-Stop Simulator**: Quick FOV framing (`72 deg` widefield down to `0.15 deg` planetary) with circular eyepiece vignette and illuminated reticle.
- **Live Observatory Locator & Night Vision**: Interactive Leaflet map picker, browser GPS detection, 8 global observatory presets, 24h sky-brightness scrubber, Bortle 1-9 light pollution & exposure gain tuners, and red rod-preserving astronomer theme.

## License

Built atop **Stellarium Web Engine**, licensed under the **GNU Affero General Public License v3.0** (`LICENSE-AGPL-3.0.txt`).
