/* ============================================================================
 * STELLARIUM ULTRA — REAL-TIME C/C++/ERFA/WebGL2 ASTRONOMY OBSERVATORY
 * Engine: Compiled Stellarium Web Engine WASM (GNU AGPL v3, ./LICENSE-AGPL-3.0.txt)
 * Enhanced UI Architecture: Modular SCSS + Native Ephemeris + Optical Simulator
 * ============================================================================ */
(function () {
  'use strict';

  const D2R = Math.PI / 180;
  const R2D = 180 / Math.PI;
  const $ = (id) => document.getElementById(id);

  // --------------------------------------------------------------------------
  // 1. OBSERVATORY PRESETS & DEEP ASTRONOMICAL SEARCH CATALOG
  // --------------------------------------------------------------------------
  const OBSERVATORIES = [
    { key: 'sofia', name: 'Sofia Observatory', country: 'Bulgaria', lat: 42.6977, lon: 23.3219, elev: 590, tag: '42.7°N' },
    { key: 'melbourne', name: 'Melbourne Observatory', country: 'Australia', lat: -37.8136, lon: 144.9631, elev: 31, tag: '37.8°S' },
    { key: 'atacama', name: 'Paranal (ESO VLT)', country: 'Atacama Desert', lat: -24.6275, lon: -70.4045, elev: 2635, tag: 'Bortle 1' },
    { key: 'maunakea', name: 'Mauna Kea Summit', country: 'Hawaii, USA', lat: 19.8207, lon: -155.4681, elev: 4205, tag: 'Bortle 1' },
    { key: 'lapalma', name: 'Roque de los Muchachos', country: 'La Palma, Spain', lat: 28.7636, lon: -17.8947, elev: 2396, tag: 'Bortle 1' },
    { key: 'greenwich', name: 'Royal Observatory Greenwich', country: 'United Kingdom', lat: 51.4779, lon: -0.0015, elev: 47, tag: '0.0° Prime' },
    { key: 'tokyo', name: 'Mitaka NAOJ Observatory', country: 'Japan', lat: 35.6752, lon: 139.5391, elev: 58, tag: '139.5°E' },
    { key: 'nyc', name: 'New York Skies', country: 'USA', lat: 40.7128, lon: -74.0060, elev: 15, tag: '40.7°N' }
  ];

  const SKY_CATALOG = [
    { query: 'NAME Moon', name: 'Moon', sub: 'Earth Natural Satellite', kind: 'Moon', icon: 'moon.svg', fov: 4 },
    { query: 'NAME Sun', name: 'Sun', sub: 'G2V Yellow Dwarf Star', kind: 'Star', icon: 'sun.svg', fov: 4 },
    { query: 'NAME Mercury', name: 'Mercury', sub: 'Innermost Terrestrial Planet', kind: 'Planet', icon: 'planet.svg', fov: 12 },
    { query: 'NAME Venus', name: 'Venus', sub: 'Cloud-Shrouded Terrestrial Planet', kind: 'Planet', icon: 'planet.svg', fov: 12 },
    { query: 'NAME Mars', name: 'Mars', sub: 'The Red Planet', kind: 'Planet', icon: 'planet.svg', fov: 12 },
    { query: 'NAME Jupiter', name: 'Jupiter', sub: 'Gas Giant + Galilean Moons', kind: 'Planet', icon: 'planet.svg', fov: 8 },
    { query: 'NAME Saturn', name: 'Saturn', sub: 'Ringed Gas Giant + Titan', kind: 'Planet', icon: 'planet.svg', fov: 6 },
    { query: 'NAME Uranus', name: 'Uranus', sub: 'Ice Giant (7th Planet)', kind: 'Planet', icon: 'planet.svg', fov: 12 },
    { query: 'NAME Neptune', name: 'Neptune', sub: 'Outermost Ice Giant', kind: 'Planet', icon: 'planet.svg', fov: 12 },
    { query: 'NAME Sirius', name: 'Sirius (Alpha CMa)', sub: 'Brightest Star in Night Sky (-1.46m)', kind: 'Star', icon: 'star.svg', fov: 22 },
    { query: 'NAME Canopus', name: 'Canopus (Alpha Car)', sub: 'Bright Supergiant in Carina (-0.74m)', kind: 'Star', icon: 'star.svg', fov: 24 },
    { query: 'NAME Arcturus', name: 'Arcturus (Alpha Boo)', sub: 'Red Giant in Bootes (-0.05m)', kind: 'Star', icon: 'star.svg', fov: 24 },
    { query: 'NAME Vega', name: 'Vega (Alpha Lyr)', sub: 'Summer Triangle Zero-Mag Standard', kind: 'Star', icon: 'star.svg', fov: 24 },
    { query: 'NAME Capella', name: 'Capella (Alpha Aur)', sub: 'Quadruple Star System in Auriga', kind: 'Star', icon: 'double_star.svg', fov: 24 },
    { query: 'NAME Rigel', name: 'Rigel (Beta Ori)', sub: 'Blue Supergiant in Orion', kind: 'Star', icon: 'star.svg', fov: 22 },
    { query: 'NAME Procyon', name: 'Procyon (Alpha CMi)', sub: 'Winter Triangle Binary Star', kind: 'Star', icon: 'double_star.svg', fov: 22 },
    { query: 'NAME Betelgeuse', name: 'Betelgeuse (Alpha Ori)', sub: 'Red Supergiant in Orion', kind: 'Star', icon: 'variable_star.svg', fov: 20 },
    { query: 'NAME Altair', name: 'Altair (Alpha Aql)', sub: 'Fast-Spinning A-Type Star in Aquila', kind: 'Star', icon: 'star.svg', fov: 24 },
    { query: 'NAME Aldebaran', name: 'Aldebaran (Alpha Tau)', sub: 'Red Giant Bull’s Eye in Taurus', kind: 'Star', icon: 'star.svg', fov: 20 },
    { query: 'NAME Antares', name: 'Antares (Alpha Sco)', sub: 'Heart of the Scorpion Supergiant', kind: 'Star', icon: 'variable_star.svg', fov: 20 },
    { query: 'NAME Spica', name: 'Spica (Alpha Vir)', sub: 'Spectroscopic Binary in Virgo', kind: 'Star', icon: 'double_star.svg', fov: 22 },
    { query: 'NAME Fomalhaut', name: 'Fomalhaut (Alpha PsA)', sub: 'Debris-Disk Star in Piscis Austrinus', kind: 'Star', icon: 'star.svg', fov: 22 },
    { query: 'NAME Deneb', name: 'Deneb (Alpha Cyg)', sub: 'Luminous Supergiant in Cygnus', kind: 'Star', icon: 'star.svg', fov: 24 },
    { query: 'NAME Polaris', name: 'Polaris (Alpha UMi)', sub: 'North Celestial Pole Star', kind: 'Star', icon: 'star.svg', fov: 28 },
    { query: 'M31', name: 'Andromeda Galaxy (M31)', sub: 'Closest Major Spiral Galaxy (2.54 Mly)', kind: 'Galaxy', icon: 'galaxy.svg', fov: 6 },
    { query: 'M42', name: 'Orion Nebula (M42)', sub: 'Diffuse Star-Forming Emission Nebula', kind: 'Nebula', icon: 'bright_emission_nebula.svg', fov: 3.5 },
    { query: 'M45', name: 'The Pleiades (M45)', sub: 'Seven Sisters Open Star Cluster', kind: 'Open Cluster', icon: 'open_galactic_cluster.svg', fov: 4.5 },
    { query: 'M13', name: 'Hercules Cluster (M13)', sub: 'Great Northern Globular Cluster', kind: 'Globular', icon: 'globular_star_cluster.svg', fov: 2.2 },
    { query: 'M8', name: 'Lagoon Nebula (M8)', sub: 'Giant Interstellar Cloud in Sagittarius', kind: 'Nebula', icon: 'bright_emission_nebula.svg', fov: 4 },
    { query: 'M57', name: 'Ring Nebula (M57)', sub: 'Iconic Planetary Nebula in Lyra', kind: 'Planetary', icon: 'planetary_nebula.svg', fov: 1.5 },
    { query: 'M27', name: 'Dumbbell Nebula (M27)', sub: 'Bright Planetary Nebula in Vulpecula', kind: 'Planetary', icon: 'planetary_nebula.svg', fov: 1.8 },
    { query: 'M51', name: 'Whirlpool Galaxy (M51)', sub: 'Interacting Grand-Design Spiral', kind: 'Galaxy', icon: 'interacting_galaxy.svg', fov: 2.5 },
    { query: 'M104', name: 'Sombrero Galaxy (M104)', sub: 'Unbarred Spiral with Dust Lane in Virgo', kind: 'Galaxy', icon: 'galaxy.svg', fov: 2.2 },
    { query: 'M44', name: 'Beehive Cluster (M44)', sub: 'Praesepe Open Cluster in Cancer', kind: 'Open Cluster', icon: 'open_galactic_cluster.svg', fov: 5 },
    { query: 'M22', name: 'Sagittarius Cluster (M22)', sub: 'Bright Southern Globular Cluster', kind: 'Globular', icon: 'globular_star_cluster.svg', fov: 2.5 },
    { query: 'M1', name: 'Crab Nebula (M1)', sub: '1054 AD Supernova Remnant in Taurus', kind: 'SNR', icon: 'bright_emission_nebula.svg', fov: 2 },
    { query: 'M16', name: 'Eagle Nebula (M16)', sub: 'Home of the Pillars of Creation', kind: 'Nebula', icon: 'bright_emission_nebula.svg', fov: 3 },
    { query: 'M20', name: 'Trifid Nebula (M20)', sub: 'Emission + Reflection Nebula in Sagittarius', kind: 'Nebula', icon: 'bright_emission_nebula.svg', fov: 3 },
    { query: 'NGC 869', name: 'Double Cluster (NGC 869)', sub: 'Twin Open Clusters in Perseus', kind: 'Open Cluster', icon: 'open_galactic_cluster.svg', fov: 4 },
    { query: 'NGC 3372', raDecDeg: [159.23, -58.62], name: 'Carina Cliffs (JWST Plate)', sub: 'JWST NIRCam Clarified Mosaic · 7,600 LY', kind: 'JWST Plate', icon: 'bright_emission_nebula.svg', fov: 1.8, plateImg: './symbols/plates/jwst_carina_clarified.jpg', preferArchive: true, sglInfo: { dist: '7,600 LY', scale: '16 LY Cliffs', instrument: 'JWST NIRCam', type: 'Star-Forming Region' } },
    { query: 'Cas A', raDecDeg: [350.85, 58.815], name: 'Cassiopeia A (JWST MIRI)', sub: 'Clarified Supernova Remnant · 11,000 LY', kind: 'Supernova Remnant', icon: 'nebula_default.svg', fov: 0.9, plateImg: './symbols/plates/cassiopeia_a_clarified.jpg', preferArchive: true, sglInfo: { dist: '11,000 LY', scale: '10 LY Shell', instrument: 'JWST MIRI', type: 'Supernova Remnant' } },
    { query: 'SMACS J0723', raDecDeg: [110.83, -73.45], name: 'JWST SMACS 0723 Deep Field', sub: 'Gravitational Lens Galaxy Cluster · 4.6B LY', kind: 'Galaxy Cluster', icon: 'group_of_galaxies.svg', fov: 0.45, plateImg: './symbols/plates/jwst_smacs0723_clarified.jpg', preferArchive: true, sglInfo: { dist: '4.6 Billion LY', scale: 'Gravitational Lens', instrument: 'JWST NIRCam', type: 'Galaxy Cluster' } },
    { query: 'HUDF', raDecDeg: [53.16, -27.79], name: 'Hubble Ultra Deep Field', sub: 'Clarified 10,000-Galaxy Deep Field · 13.2B LY', kind: 'Deep Field', icon: 'group_of_galaxies.svg', fov: 0.45, plateImg: './symbols/plates/hubble_deep_field_clarified.jpg', preferArchive: true, sglInfo: { dist: '13.2 Billion LY', scale: '10,000+ Galaxies', instrument: 'Hubble ACS/WFC3', type: 'Cosmological Deep Field' } },
    { query: 'TRAPPIST-1', raDecDeg: [346.62, -5.04], name: 'TRAPPIST-1e (SGL 550 AU)', sub: 'Temperate Rocky Exoplanet · 39.46 LY (Aquarius)', kind: 'Exoplanet', icon: 'planet.svg', fov: 0.6, plateImg: './symbols/plates/trappist_1e.jpg', preferArchive: true, sglInfo: { dist: '39.46 LY', scale: '0.92 R_Earth · 5.65 g/cm³', instrument: 'Solar Gravitational Lens (550 AU)', type: 'Habitable Exoplanet' } },
    { query: 'Kepler-1649', raDecDeg: [297.50, 41.75], name: 'Kepler-1649c (SGL 550 AU)', sub: 'Earth-Sized Habitable Zone World · 301 LY', kind: 'Exoplanet', icon: 'planet.svg', fov: 0.6, plateImg: './symbols/plates/kepler_1649c.jpg', preferArchive: true, sglInfo: { dist: '301.0 LY', scale: '1.06 R_Earth · 75% Solar Flux', instrument: 'Solar Gravitational Lens (550 AU)', type: 'Habitable Exoplanet' } },
    { query: 'Kepler-186', raDecDeg: [298.65, 43.96], name: 'Kepler-186f (SGL 550 AU)', sub: 'First Earth-Size Habitable Exoplanet · 582 LY', kind: 'Exoplanet', icon: 'planet.svg', fov: 0.6, plateImg: './symbols/plates/kepler_186f.jpg', preferArchive: true, sglInfo: { dist: '582 LY', scale: '1.17 R_Earth', instrument: 'Solar Gravitational Lens (550 AU)', type: 'Habitable Exoplanet' } },
    { query: 'NAME Earth', raDecDeg: [180.0, 0.0], name: 'Planet Earth (DSCOVR EPIC)', sub: 'Sun-Earth L1 Lagrange Blue Marble · 1.5M km', kind: 'Biosphere', icon: 'planet.svg', fov: 6.0, plateImg: './symbols/plates/epic_earth.jpg', preferArchive: true, sglInfo: { dist: '1.5M km (L1)', scale: '1.00 R_Earth · 12,742 km', instrument: 'DSCOVR EPIC', type: 'Reference Biosphere' } }
  ];

  function findArchivalPlate(obj, primaryName) {
    if (obj && obj.__catalogItem && obj.__catalogItem.plateImg) {
      return {
        plateImg: obj.__catalogItem.plateImg,
        plateTitle: obj.__catalogItem.name,
        sglInfo: obj.__catalogItem.sglInfo || null,
        preferArchive: !!obj.__catalogItem.preferArchive
      };
    }
    const clean = (primaryName || '').toLowerCase();
    return SKY_CATALOG.find((item) => {
      if (!item.plateImg) return false;
      const q = item.query.toLowerCase();
      return (q && clean.includes(q.replace(/^name\s+/i, ''))) ||
        (clean.includes('carina') && item.plateImg.includes('carina')) ||
        (clean.includes('cassiopeia') && item.plateImg.includes('cassiopeia')) ||
        (clean.includes('smacs') && item.plateImg.includes('smacs')) ||
        (clean.includes('hubble') && item.plateImg.includes('hubble')) ||
        (clean.includes('trappist') && item.plateImg.includes('trappist')) ||
        (clean.includes('kepler-1649') && item.plateImg.includes('kepler_1649c')) ||
        (clean.includes('kepler-186') && item.plateImg.includes('kepler_186f')) ||
        (clean === 'earth' && item.plateImg.includes('epic_earth'));
    }) || null;
  }

  const VIS_PLANETS = [
    { q: 'NAME Sun', name: 'Sun', icon: 'sun.svg', fov: 4 },
    { q: 'NAME Moon', name: 'Moon', icon: 'moon_full.svg', fov: 4 },
    { q: 'NAME Mercury', name: 'Mercury', icon: 'planet.svg', fov: 12 },
    { q: 'NAME Venus', name: 'Venus', icon: 'planet.svg', fov: 12 },
    { q: 'NAME Mars', name: 'Mars', icon: 'planet.svg', fov: 12 },
    { q: 'NAME Jupiter', name: 'Jupiter', icon: 'planet.svg', fov: 8 },
    { q: 'NAME Saturn', name: 'Saturn', icon: 'planet.svg', fov: 6 }
  ];

  // --------------------------------------------------------------------------
  // 2. APPLICATION STATE
  // --------------------------------------------------------------------------
  const state = {
    stel: null,
    core: null,
    location: OBSERVATORIES[0],
    selectedObj: null,
    eyepieceOn: false,
    nightMode: false,
    showFPS: false,
    drawerOpen: false,
    timePopoverOpen: false,
    calendarLoaded: false,
    calendarEvents: [],
    skyCultureKey: 'western',
    hdrPostFx: null,
    astroRenderer: null,
    pendingCatalogObj: null,
    pendingCatalogTs: 0,
    loupeZoom: 4.0,
    activePlate: null,
    leafletMap: null,
    leafletMarker: null,
    timeRepeatTimer: null
  };

  // --------------------------------------------------------------------------
  // 3. ASTRONOMICAL FORMATTING & TARGET ICON HELPERS
  // --------------------------------------------------------------------------
  function pad2(n) {
    return String(Math.abs(n)).padStart(2, '0');
  }

  function formatHms(hms) {
    if (!hms) return '--h --m --s';
    return `${pad2(hms.h || 0)}h ${pad2(hms.m || 0)}m ${pad2(Math.floor(hms.s || 0))}s`;
  }

  function formatDms(dms, signed) {
    if (!dms) return '--° --\' --"';
    const s = signed ? (dms.sign < 0 ? '-' : '+') : '';
    return `${s}${pad2(dms.d || 0)}° ${pad2(dms.m || 0)}' ${pad2(Math.floor(dms.s || 0))}"`;
  }

  function mjdToLocalHHMM(stel, mjd) {
    if (typeof mjd !== 'number' || !isFinite(mjd)) return '--:--';
    const d = stel.MJD2date(mjd);
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  }

  function pickTargetSvg(obj, primaryName) {
    const n = (primaryName || '').toLowerCase();
    const matchedCat = SKY_CATALOG.find((c) => n === c.name.toLowerCase() || n.includes(c.name.split(' ')[0].toLowerCase()));
    if (matchedCat) return `./symbols/target_types/${matchedCat.icon}`;
    const typeStr = String((obj && obj.type) || '').toLowerCase();
    if (n.includes('moon')) return './symbols/target_types/moon_first_quarter.svg';
    if (n.includes('sun')) return './symbols/target_types/sun.svg';
    if (/^(mercury|venus|mars|jupiter|saturn|uranus|neptune|pluto)/.test(n)) return './symbols/target_types/planet.svg';
    if (/^(iss|starlink|noaa|hubble|tiangong|cosmos|iridium|gps|galileo)/i.test(n) || typeStr.includes('sat')) return './symbols/target_types/artificial_satellite.svg';
    if (/^c\/|^\d+p\//i.test(n) || typeStr.includes('comet')) return './symbols/target_types/comet.svg';
    if (/^(ngc|ic|m)\s*\d+/i.test(n) || typeStr.includes('dso')) return './symbols/target_types/deep_sky.svg';
    if (typeStr.includes('star') || /^(\*|hip|hd|hr|tyc|sao)/i.test(n)) return './symbols/target_types/star.svg';
    return './symbols/target_types/unknown.svg';
  }

  function pickEventSvg(typeStr) {
    const t = String(typeStr || '').toLowerCase();
    if (t.includes('full')) return './symbols/target_types/moon_full.svg';
    if (t.includes('new')) return './symbols/target_types/moon_new.svg';
    if (t.includes('first')) return './symbols/target_types/moon_first_quarter.svg';
    if (t.includes('last') || t.includes('third')) return './symbols/target_types/moon_last_quarter.svg';
    if (t.includes('lunar_eclipse')) return './symbols/target_types/moon_eclipse.svg';
    if (t.includes('solar_eclipse')) return './symbols/target_types/sun_eclipse.svg';
    if (t.includes('opposition')) return './symbols/target_types/sun_opposition.svg';
    if (t.includes('conjunction')) return './symbols/target_types/conjunction.svg';
    return './symbols/target_types/deep_sky.svg';
  }

  // Exact Evening Astronomical Dusk MJD Solver using WASM observer.clone()
  function computeEveningTwilightMJD(stel) {
    const sun = stel.getObj('NAME Sun');
    const nowMjd = stel.date2MJD(new Date());
    if (!sun) return nowMjd;

    const tmpObs = stel.observer.clone();
    let bestMjd = nowMjd;
    let prevAlt = null;

    for (let step = 0; step <= 96; step++) {
      const mjd = nowMjd + step / 96;
      tmpObs.utc = mjd;
      const radec = sun.getInfo('radec', tmpObs);
      if (!radec) continue;
      const obsV = stel.convertFrame(tmpObs, 'ICRF', 'OBSERVED', radec);
      const alt = Math.asin(Math.max(-1, Math.min(1, obsV[2])));
      if (prevAlt !== null && prevAlt > -13 * D2R && alt <= -13 * D2R) {
        bestMjd = mjd;
        break;
      }
      if (step === 0 && alt <= -13 * D2R && alt > -65 * D2R) {
        bestMjd = mjd;
        break;
      }
      prevAlt = alt;
    }

    tmpObs.destroy();
    return bestMjd;
  }

  // Compute Exact 24h Solar Illumination CSS Gradient (from planets-visibility.vue)
  function compute24hSolarGradient(stel, noonLocalDate) {
    const sun = stel.getObj('NAME Sun');
    if (!sun) return 'linear-gradient(to right, #081226 0%, #35add3 50%, #081226 100%)';

    const obs = stel.observer.clone();
    const stops = [];
    const probe = new Date(noonLocalDate.getTime());

    for (let i = 0; i <= 24; i++) {
      obs.utc = stel.date2MJD(probe);
      const radec = sun.getInfo('radec', obs);
      let bi = 0;
      if (radec) {
        const obsV = stel.convertFrame(obs, 'ICRF', 'OBSERVED', radec);
        const altDeg = stel.anpm(stel.c2s(obsV)[1]) * R2D;
        bi = Math.max(0, Math.min(1, (altDeg + 14) / 26));
      }
      const r = Math.round(7 + 48 * bi);
      const g = Math.round(14 + 152 * bi);
      const b = Math.round(32 + 178 * bi);
      stops.push(`rgb(${r},${g},${b}) ${Math.round((i / 24) * 100)}%`);
      probe.setHours(probe.getHours() + 1);
    }

    obs.destroy();
    return `linear-gradient(to right, ${stops.join(', ')})`;
  }

  // --------------------------------------------------------------------------
  // 4. STELLARIUM WASM KERNEL INITIALIZATION
  // --------------------------------------------------------------------------
  function bootStellarium() {
    const baseUrl = new URL('./', window.location.href).href;
    const statusEl = $('bootStatus');
    const canvas = $('stel-canvas');

    if (typeof window.StelWebEngine !== 'function') {
      statusEl.textContent = 'Error: stellarium-web-engine.js failed to load.';
      return;
    }

    if (typeof window.AeternaHdrPostFx === 'function') {
      state.hdrPostFx = new window.AeternaHdrPostFx(canvas, $('fx-canvas'));
      state.hdrPostFx.bloomStrength = 0.38;
      state.hdrPostFx.diffractionStrength = 0.55;
    }

    window.StelWebEngine({
      wasmFile: `${baseUrl}engine/stellarium-web-engine.wasm`,
      canvas: canvas,
      preserveDrawingBuffer: true,
      onPostRender: () => {
        if (state.hdrPostFx) state.hdrPostFx.render();
      },
      translateFn: (_domain, str) => str,
      onReady: (stel) => {
        state.stel = stel;
        state.core = stel.core;
        const c = stel.core;

        statusEl.textContent = 'Streaming Stars, Milky Way, Palomar DSS2 & JWST Plates...';

        // Official NanoVG Vector Fonts
        stel.setFont('regular', `${baseUrl}fonts/Roboto-Regular.ttf`, 1.38);
        stel.setFont('bold', `${baseUrl}fonts/Roboto-Bold.ttf`, 1.38);

        // Attach All Self-Hosted + Open CORS Deep-Sky HiPS Catalogs
        c.stars.addDataSource({ url: `${baseUrl}skydata/stars` });
        c.skycultures.addDataSource({ url: `${baseUrl}skydata/skycultures/western`, key: 'western' });
        c.dsos.addDataSource({ url: `${baseUrl}skydata/dso` });
        c.landscapes.addDataSource({ url: `${baseUrl}skydata/landscapes/guereins`, key: 'guereins' });
        c.milkyway.addDataSource({ url: `${baseUrl}skydata/surveys/milkyway` });
        c.dss.addDataSource({ url: 'https://skies.esac.esa.int/DSSColor' });
        c.minor_planets.addDataSource({ url: `${baseUrl}skydata/mpcorb.dat`, key: 'mpc_asteroids' });
        c.planets.addDataSource({ url: `${baseUrl}skydata/surveys/sso/moon`, key: 'moon' });
        c.planets.addDataSource({ url: `${baseUrl}skydata/surveys/sso/moon-normal`, key: 'moon-normal' });
        c.planets.addDataSource({ url: `${baseUrl}skydata/surveys/sso/sun`, key: 'sun' });
        c.planets.addDataSource({ url: `${baseUrl}skydata/surveys/sso/mercury`, key: 'mercury' });
        c.planets.addDataSource({ url: `${baseUrl}skydata/surveys/sso/venus`, key: 'venus' });
        c.planets.addDataSource({ url: `${baseUrl}skydata/surveys/sso/earth`, key: 'earth' });
        c.planets.addDataSource({ url: `${baseUrl}skydata/surveys/sso/mars`, key: 'mars' });
        c.planets.addDataSource({ url: `${baseUrl}skydata/surveys/sso/jupiter`, key: 'jupiter' });
        c.planets.addDataSource({ url: `${baseUrl}skydata/surveys/sso/saturn`, key: 'saturn' });
        c.planets.addDataSource({ url: `${baseUrl}skydata/surveys/sso/uranus`, key: 'uranus' });
        c.planets.addDataSource({ url: `${baseUrl}skydata/surveys/sso/neptune`, key: 'neptune' });
        c.planets.addDataSource({ url: `${baseUrl}skydata/surveys/sso/moon`, key: 'default' });
        c.comets.addDataSource({ url: `${baseUrl}skydata/CometEls.txt`, key: 'mpc_comets' });
        c.satellites.addDataSource({ url: `${baseUrl}skydata/tle_satellite.jsonl.gz`, key: 'jsonl/sat' });

        // Calibrated Deep-Space JWST & Hubble Plate Layer in ICRF
        try {
          const jwstLayer = stel.createLayer({ id: 'jwst-plates', z: 5, visible: true });
          const deepPlates = [
            { url: `${baseUrl}symbols/plates/jwst_carina_clarified.jpg`, ra: 159.23, dec: -58.62, pixscale: 1.6, orientation: 18 },
            { url: `${baseUrl}symbols/plates/cassiopeia_a_clarified.jpg`, ra: 350.85, dec: 58.815, pixscale: 0.85, orientation: 0 },
            { url: `${baseUrl}symbols/plates/jwst_smacs0723_clarified.jpg`, ra: 110.83, dec: -73.45, pixscale: 0.35, orientation: 0 },
            { url: `${baseUrl}symbols/plates/hubble_deep_field_clarified.jpg`, ra: 53.16, dec: -27.79, pixscale: 0.32, orientation: 0 }
          ];
          deepPlates.forEach((p) => {
            const photo = jwstLayer.add('photo', {
              url: p.url,
              calibration: { ra: p.ra, dec: p.dec, pixscale: p.pixscale, orientation: p.orientation },
              render_shape: false,
              visible: true
            });
            if (photo) photo.visible = true;
          });
        } catch (_) {}

        // Authentic Observatory Sky Visuals + Active Meteors + Deep-Sky Survey
        c.atmosphere.visible = true;
        c.landscapes.visible = true;
        c.milkyway.visible = true;
        c.dss.visible = true;
        c.dsos.visible = true;
        c.satellites.visible = true;
        if (c.meteors) {
          c.meteors.visible = true;
          c.meteors.zhr = 65;
        }
        c.planets.hints_visible = true;
        c.constellations.lines_visible = true;
        c.constellations.labels_visible = true;
        c.constellations.images_visible = true;
        c.lines.azimuthal.visible = false;
        c.lines.equatorial.visible = false;
        c.lines.ecliptic.visible = false;
        c.lines.meridian.visible = false;

        c.bortle_index = 2;
        c.exposure_scale = 1.15;
        c.star_relative_scale = 1.1;
        c.time_speed = 1.0;
        c.fov = 72 * D2R;

        // Apply Sofia Observatory & Auto Evening Dusk
        applyLocation(OBSERVATORIES[0], true);

        // Initial camera orientation looking south-southeast toward rising Milky Way & constellations
        const viewVec = stel.convertFrame(stel.observer, 'OBSERVED', 'ICRF', stel.s2c(165 * D2R, 24 * D2R));
        stel.lookAt(viewVec, 0.05);

        // Reactive C/WASM Object Selection Listener (stel.change delivers core; true target is core.selection)
        stel.change((obj, attr) => {
          if (attr === 'selection') {
            const sel = (obj && obj.selection !== undefined) ? obj.selection : (state.core ? state.core.selection : null);
            if (sel) {
              state.pendingCatalogObj = null;
              handleSelectionChange(sel);
            } else if (state.pendingCatalogObj && (Date.now() - state.pendingCatalogTs) < 400) {
              handleSelectionChange(state.pendingCatalogObj);
              state.pendingCatalogObj = null;
            } else {
              handleSelectionChange(null);
            }
          }
          if (attr === 'fov') {
            updateHudReadout();
          }
        });

        if (!state.astroRenderer && typeof window.MillenniumAstroRenderer === 'function') {
          state.astroRenderer = new window.MillenniumAstroRenderer($('astroChamberCanvas'), './engine/exodus_astrophysics_engine.wasm');
        }

        renderWondersTab();
        syncBottomDock();
        syncViewSettingsUI();
        requestAnimationFrame(hudLoop);

        setTimeout(() => $('bootCurtain').classList.add('ready'), 300);
      }
    });
  }

  // --------------------------------------------------------------------------
  // 5. OBJECT SELECTION & SELECTED OBJECT INFO CARD
  // --------------------------------------------------------------------------
  function handleSelectionChange(obj) {
    state.selectedObj = obj || null;
    if (!obj) {
      $('selectionCard').classList.remove('open');
      $('btnUnlock').style.display = 'none';
      return;
    }
    $('btnUnlock').style.display = 'grid';
    renderSelectionCard(obj);
    $('selectionCard').classList.add('open');
  }

  function renderSelectionCard(obj) {
    const stel = state.stel;
    if (!stel || !obj) return;

    const cat = obj.__catalogItem || null;
    let designations = [];
    try { designations = obj.designations ? obj.designations() : []; } catch (_) {}
    const cleanList = designations.map((s) => String(s).replace(/^NAME\s+/i, '').trim()).filter(Boolean);
    const primary = cleanList[0] || (cat && cat.name) || 'Celestial Object';
    const secondary = (cat ? cat.sub : cleanList.slice(1, 5).join(' · ')) || 'Stellarium WASM Deep Sky / Ephemeris';

    let cultural = '';
    try {
      const cNames = obj.culturalDesignations ? obj.culturalDesignations() : null;
      if (Array.isArray(cNames) && cNames.length > 0) cultural = ` | Lore: ${cNames[0]}`;
      else if (cNames && typeof cNames === 'object' && Object.values(cNames).length > 0) cultural = ` | Culture: ${Object.values(cNames)[0]}`;
    } catch (_) {}

    $('scIcon').src = (cat && cat.icon) ? `./symbols/target_types/${cat.icon}` : pickTargetSvg(obj, primary);
    $('scKicker').textContent = `OBJECT TYPE // ${String((cat && cat.kind) || obj.type || 'CELESTIAL').toUpperCase()}`;
    $('scTitle').textContent = primary;
    $('scSubnames').textContent = secondary + cultural;

    let vmag = null, radec = null, phaseFrac = null, distAu = null;
    try { vmag = obj.getInfo ? obj.getInfo('vmag', stel.observer) : null; } catch (_) {}
    try { radec = obj.getInfo ? obj.getInfo('radec', stel.observer) : null; } catch (_) {}
    try { phaseFrac = obj.getInfo ? obj.getInfo('phase', stel.observer) : null; } catch (_) {}
    try { distAu = obj.getInfo ? obj.getInfo('distance', stel.observer) : null; } catch (_) {}

    if (!radec && cat && cat.raDecDeg) {
      radec = stel.s2c(cat.raDecDeg[0] * D2R, cat.raDecDeg[1] * D2R);
    }

    let ra2000 = '--', dec2000 = '--', raJnow = '--', decJnow = '--', azStr = '--', altStr = '--', altDeg = 0;
    if (radec) {
      const [ra, dec] = stel.c2s(radec);
      ra2000 = formatHms(stel.a2tf(stel.anp(ra), 1));
      dec2000 = formatDms(stel.a2af(stel.anpm(dec), 1), true);

      const jnowV = stel.convertFrame(stel.observer, 'ICRF', 'JNOW', radec);
      const [rj, dj] = stel.c2s(jnowV);
      raJnow = formatHms(stel.a2tf(stel.anp(rj), 1));
      decJnow = formatDms(stel.a2af(stel.anpm(dj), 1), true);

      const obsV = stel.convertFrame(stel.observer, 'ICRF', 'OBSERVED', radec);
      const [az, alt] = stel.c2s(obsV);
      azStr = `${(stel.anp(az) * R2D).toFixed(2)}°`;
      altDeg = alt * R2D;
      altStr = `${altDeg >= 0 ? '+' : ''}${altDeg.toFixed(2)}°`;
    }

    let visText = 'Circumpolar / Always';
    try {
      const vis = obj.computeVisibility ? obj.computeVisibility({ obs: stel.observer }) : null;
      if (Array.isArray(vis) && vis.length > 0) {
        visText = `${mjdToLocalHHMM(stel, vis[0].rise)} -> ${mjdToLocalHHMM(stel, vis[0].set)}`;
      }
    } catch (_) {}

    $('scMag').textContent = (typeof vmag === 'number' && isFinite(vmag))
      ? `${vmag.toFixed(2)} mag`
      : (cat && cat.sglInfo ? cat.sglInfo.type : 'Catalog');
    $('scAlt').textContent = altStr;
    $('scAz').textContent = azStr;

    let extraRows = '';
    if (typeof phaseFrac === 'number' && isFinite(phaseFrac)) {
      extraRows += `<span>Illuminated Phase</span><span>${(phaseFrac * 100).toFixed(1)}% Lit</span>`;
    }
    if (typeof distAu === 'number' && isFinite(distAu) && distAu > 0) {
      const distLabel = distAu < 0.01
        ? `${Math.round(distAu * 149597870.7).toLocaleString()} km (${distAu.toFixed(5)} AU)`
        : `${distAu.toFixed(4)} AU`;
      extraRows += `<span>Observer Distance</span><span>${distLabel}</span>`;
    }
    if (cat && cat.sglInfo) {
      extraRows += `
        <span>Archival Distance</span><span>${cat.sglInfo.dist}</span>
        <span>Scale / Instrument</span><span>${cat.sglInfo.scale} &bull; ${cat.sglInfo.instrument}</span>
      `;
    }

    $('scAstrometry').innerHTML = `
      <span>RA / Dec (J2000)</span><span>${ra2000} &bull; ${dec2000}</span>
      <span>RA / Dec (JNow)</span><span>${raJnow} &bull; ${decJnow}</span>
      <span>Rise / Set (Local)</span><span>${visText}</span>
      ${extraRows}
      <span>Horizon State</span><span>${altDeg >= 0 ? 'Visible Above Horizon' : 'Below Horizon'}</span>
    `;

    const plateMatch = findArchivalPlate(obj, primary);
    $('btnOpenChamber').innerHTML = plateMatch
      ? '&#128301; 1:1 Physics &amp; 4K Plate Loupe (Rust + GLSL)'
      : '&#128301; 1:1 Physics Telescope View (Rust WASM + GLSL)';
  }

  // --------------------------------------------------------------------------
  // 6. OBSERVATORY DRAWER: PLANETS VISIBILITY, WASM CALENDAR & WONDERS
  // --------------------------------------------------------------------------
  function renderVisibilityTab() {
    const stel = state.stel;
    if (!stel) return;

    const host = $('visListHost');
    const curDate = stel.MJD2date(stel.observer.utc);
    const noonStart = new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate(), 12, 0, 0);
    if (curDate.getHours() < 12) noonStart.setDate(noonStart.getDate() - 1);

    const startMjd = stel.date2MJD(noonStart);
    const endMjd = startMjd + 1.0;
    const nowFrac = Math.max(0, Math.min(1, (stel.observer.utc - startMjd) / 1.0)) * 100;
    const skyGrad = compute24hSolarGradient(stel, noonStart);

    const tmpObs = stel.observer.clone();
    tmpObs.utc = startMjd + 0.5; // Midnight reference for visibility interval

    host.innerHTML = '';
    VIS_PLANETS.forEach((p) => {
      const obj = stel.getObj(p.q);
      if (!obj) return;

      let leftPct = 0, widthPct = 0;
      let riseStr = '--:--', setStr = '--:--';
      try {
        const intervals = obj.computeVisibility({ obs: tmpObs, startTime: startMjd, endTime: endMjd });
        if (intervals && intervals.length > 0) {
          const r = intervals[0].rise;
          const s = intervals[0].set;
          riseStr = mjdToLocalHHMM(stel, r);
          setStr = mjdToLocalHHMM(stel, s);
          const rP = typeof r === 'number' ? Math.max(0, Math.min(100, (r - startMjd) * 100)) : 0;
          const sP = typeof s === 'number' ? Math.max(0, Math.min(100, (s - startMjd) * 100)) : 100;
          if (sP >= rP) {
            leftPct = rP;
            widthPct = Math.max(2, sP - rP);
          } else {
            leftPct = 0;
            widthPct = sP;
          }
        }
      } catch (_) {}

      let curAltDeg = 0;
      const radec = obj.getInfo('radec', stel.observer);
      if (radec) {
        const obsV = stel.convertFrame(stel.observer, 'ICRF', 'OBSERVED', radec);
        curAltDeg = Math.asin(Math.max(-1, Math.min(1, obsV[2]))) * R2D;
      }

      const row = document.createElement('div');
      row.className = 'vis-row';
      row.innerHTML = `
        <div class="p-name">${p.name}<small>${riseStr}–${setStr}</small></div>
        <div class="p-bar-bg" style="background:${skyGrad};">
          <div class="p-vis-seg" style="left:${leftPct.toFixed(1)}%;width:${widthPct.toFixed(1)}%;"></div>
          <div class="p-now-tick" style="left:${nowFrac.toFixed(1)}%;"></div>
        </div>
        <div class="p-alt ${curAltDeg >= 0 ? 'up' : ''}">${curAltDeg >= 0 ? '+' : ''}${curAltDeg.toFixed(0)}°</div>
      `;
      row.addEventListener('click', () => {
        stel.core.selection = obj;
        stel.pointAndLock(obj, 0.95);
        stel.zoomTo(p.fov * D2R, 0.95);
      });
      host.appendChild(row);
    });

    tmpObs.destroy();
  }

  function loadAstronomicalCalendar() {
    const stel = state.stel;
    if (!stel || state.calendarLoaded) return;
    state.calendarLoaded = true;

    const host = $('calListHost');
    host.innerHTML = `<div style="font-size:11.5px;color:var(--su-text-dim);padding:8px;">Computing next 45 days via ERFA/WASM ephemeris...</div>`;

    const start = stel.MJD2date(stel.observer.utc);
    const end = new Date(start.getTime() + 45 * 86400 * 1000);
    const events = [];

    try {
      const step = stel.calendar({
        start,
        end,
        iterator: true,
        onEvent: (ev) => events.push(ev)
      });

      function tickChunk() {
        const running = step();
        if (running) {
          setTimeout(tickChunk, 8);
          return;
        }
        state.calendarEvents = events.sort((a, b) => a.time - b.time);
        renderCalendarList();
      }
      setTimeout(tickChunk, 20);
    } catch (_) {
      host.innerHTML = `<div style="font-size:11.5px;color:var(--su-text-dim);">Calendar ephemeris unavailable right now.</div>`;
    }
  }

  function renderCalendarList() {
    const host = $('calListHost');
    if (state.calendarEvents.length === 0) {
      host.innerHTML = `<div style="font-size:11.5px;color:var(--su-text-dim);">No major events found in next 45 days.</div>`;
      return;
    }

    host.innerHTML = '';
    state.calendarEvents.slice(0, 28).forEach((ev) => {
      const el = document.createElement('div');
      el.className = 'cal-item';
      const when = ev.time ? `${ev.time.toLocaleDateString()} ${pad2(ev.time.getHours())}:${pad2(ev.time.getMinutes())}` : '';
      const label = (ev.desc || ev.type || 'Event').replace(/_/g, ' ');
      el.innerHTML = `
        <img src="${pickEventSvg(ev.type)}" alt="" />
        <div class="cal-meta">
          <strong>${label}</strong>
          <span>${when}</span>
        </div>
      `;
      el.addEventListener('click', () => {
        if (!state.stel) return;
        if (ev.time) state.stel.observer.utc = state.stel.date2MJD(ev.time);
        const focus = ev.o1 || ev.o2;
        if (focus) {
          state.stel.core.selection = focus;
          state.stel.pointAndLock(focus, 0.9);
          state.stel.zoomTo(14 * D2R, 0.9);
        }
        renderVisibilityTab();
        syncTimePopover();
      });
      host.appendChild(el);
    });
  }

  function renderWondersTab() {
    const host = $('wondersListHost');
    host.innerHTML = '';
    SKY_CATALOG.filter((c) => ['Galaxy', 'Nebula', 'Open Cluster', 'Globular', 'Planetary', 'SNR', 'Moon', 'Planet', 'JWST Plate'].includes(c.kind)).forEach((item) => {
      const card = document.createElement('div');
      card.className = 'wonder-card';
      card.innerHTML = `
        <img src="./symbols/target_types/${item.icon}" alt="" />
        <div class="wc-txt">
          <strong>${item.name}</strong>
          <span>${item.sub}</span>
        </div>
        <span class="wc-fov">${item.fov}°</span>
      `;
      card.addEventListener('click', () => focusCatalogItem(item));
      host.appendChild(card);
    });
  }

  function makeCatalogDescriptor(item) {
    const icrf = item.raDecDeg
      ? state.stel.s2c(item.raDecDeg[0] * D2R, item.raDecDeg[1] * D2R)
      : null;
    return {
      __catalogItem: item,
      type: item.kind || 'Archive',
      designations: () => [item.name],
      getInfo: (key) => (key === 'radec' ? icrf : null)
    };
  }

  function focusCatalogItem(item) {
    if (!state.stel) return;
    const obj = state.stel.getObj(item.query);
    if (obj) {
      state.pendingCatalogObj = null;
      state.stel.core.selection = obj;
      state.stel.pointAndLock(obj, 0.95);
      state.stel.zoomTo(item.fov * D2R, 0.95);
      if (item.plateImg) {
        // Attach archival metadata silently via name lookup in findArchivalPlate
        renderSelectionCard(obj);
      }
    } else if (item.raDecDeg) {
      const catObj = makeCatalogDescriptor(item);
      state.pendingCatalogObj = catObj;
      state.pendingCatalogTs = Date.now();
      state.stel.core.selection = null;
      const icrf = catObj.getInfo('radec');
      if (icrf) state.stel.lookAt(icrf, 0.95);
      state.stel.zoomTo(item.fov * D2R, 0.95);
      handleSelectionChange(catObj);
    }
  }

  // --------------------------------------------------------------------------
  // 7. OMNI-SEARCH ACROSS CATALOG + NATIVE WASM OBJECT MEMORY
  // --------------------------------------------------------------------------
  function runSkySearch(raw) {
    const q = raw.trim();
    const lc = q.toLowerCase();
    const resEl = $('searchResults');
    $('btnClearSearch').classList.toggle('visible', q.length > 0);

    if (!q) {
      resEl.classList.remove('open');
      return;
    }

    const matches = [];
    SKY_CATALOG.forEach((item) => {
      if (item.name.toLowerCase().includes(lc) || item.sub.toLowerCase().includes(lc) || item.query.toLowerCase().includes(lc)) {
        matches.push(item);
      }
    });

    // Dynamic direct lookup in Stellarium C/WASM sky database (HIP / HD / M / NGC / IC / Satellites)
    let dynamicObj = null;
    if (state.stel && q.length >= 2 && !matches.some((m) => m.name.toLowerCase() === lc)) {
      try {
        dynamicObj = state.stel.getObj(`NAME ${q}`) || state.stel.getObj(q);
      } catch (_) {}
    }

    resEl.innerHTML = '';

    if (dynamicObj) {
      const row = document.createElement('div');
      row.className = 'sr-row';
      row.innerHTML = `
        <img src="${pickTargetSvg(dynamicObj, q)}" alt="" />
        <div class="sr-info">
          <strong>${q.toUpperCase()}</strong>
          <span>Live Stellarium WASM Catalog Object</span>
        </div>
        <span class="sr-kind">Catalog</span>
      `;
      row.addEventListener('click', () => {
        resEl.classList.remove('open');
        state.stel.core.selection = dynamicObj;
        state.stel.pointAndLock(dynamicObj, 0.95);
        state.stel.zoomTo(12 * D2R, 0.95);
      });
      resEl.appendChild(row);
    }

    matches.slice(0, 10).forEach((item) => {
      const row = document.createElement('div');
      row.className = 'sr-row';
      row.innerHTML = `
        <img src="./symbols/target_types/${item.icon}" alt="" />
        <div class="sr-info">
          <strong>${item.name}</strong>
          <span>${item.sub}</span>
        </div>
        <span class="sr-kind">${item.kind}</span>
      `;
      row.addEventListener('click', () => {
        resEl.classList.remove('open');
        $('skySearchInput').value = item.name;
        focusCatalogItem(item);
      });
      resEl.appendChild(row);
    });

    if (!dynamicObj && matches.length === 0) {
      resEl.innerHTML = `<div class="sr-row"><div class="sr-info"><span>No celestial object matched "${q}". Try Sirius, Jupiter, M31, M42, Polaris, HIP 32349...</span></div></div>`;
    }
    resEl.classList.add('open');
  }

  // --------------------------------------------------------------------------
  // 8. LOCATION MANAGER (LEAFLET INTERACTIVE MAP + GPS + PRESETS)
  // --------------------------------------------------------------------------
  function applyLocation(loc, jumpDusk) {
    const stel = state.stel;
    if (!stel) return;
    state.location = loc;
    stel.observer.latitude = loc.lat * D2R;
    stel.observer.longitude = loc.lon * D2R;
    stel.observer.elevation = Number(loc.elev || 0);

    $('locBadgeTitle').textContent = loc.name;
    $('locBadgeCoords').textContent = `${Math.abs(loc.lat).toFixed(2)}°${loc.lat >= 0 ? 'N' : 'S'} · ${Math.abs(loc.lon).toFixed(2)}°${loc.lon >= 0 ? 'E' : 'W'}`;

    $('inpLat').value = loc.lat.toFixed(4);
    $('inpLon').value = loc.lon.toFixed(4);
    $('inpElev').value = Math.round(loc.elev || 0);

    if (jumpDusk) {
      stel.observer.utc = computeEveningTwilightMJD(stel);
    }

    if (state.leafletMap && state.leafletMarker) {
      state.leafletMap.setView([loc.lat, loc.lon], 8);
      state.leafletMarker.setLatLng([loc.lat, loc.lon]);
    }

    state.calendarLoaded = false;
    if (state.drawerOpen) renderVisibilityTab();
    if (state.selectedObj) renderSelectionCard(state.selectedObj);
  }

  function ensureLeafletMap() {
    if (typeof window.L === 'undefined') return;
    if (state.leafletMap) {
      setTimeout(() => state.leafletMap.invalidateSize(), 60);
      return;
    }
    try {
      const map = L.map('locLeafletMap', { zoomControl: true }).setView([state.location.lat, state.location.lon], 7);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);
      const marker = L.marker([state.location.lat, state.location.lon], { draggable: true }).addTo(map);

      const updateFromLatLng = (latlng) => {
        applyLocation({
          key: 'custom',
          name: `Custom Sky (${latlng.lat.toFixed(2)}°, ${latlng.lng.toFixed(2)}°)`,
          lat: latlng.lat,
          lon: latlng.lng,
          elev: Number($('inpElev').value || 50)
        }, false);
      };

      marker.on('dragend', () => updateFromLatLng(marker.getLatLng()));
      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        updateFromLatLng(e.latlng);
      });

      state.leafletMap = map;
      state.leafletMarker = marker;
    } catch (_) {}
  }

  // --------------------------------------------------------------------------
  // 9. DATE & TIME PICKER POPOVER
  // --------------------------------------------------------------------------
  function syncTimePopover() {
    const stel = state.stel;
    if (!stel) return;
    const d = stel.MJD2date(stel.observer.utc);

    $('tpYear').textContent = d.getFullYear();
    $('tpMonth').textContent = pad2(d.getMonth() + 1);
    $('tpDay').textContent = pad2(d.getDate());
    $('tpHour').textContent = pad2(d.getHours());
    $('tpMin').textContent = pad2(d.getMinutes());
    $('tpSec').textContent = pad2(d.getSeconds());

    const mins = d.getHours() * 60 + d.getMinutes();
    $('tpMinuteSlider').value = mins;

    const midnight = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
    $('skyGradBar').style.background = compute24hSolarGradient(stel, midnight);
  }

  function stepDateTime(unit, delta) {
    const stel = state.stel;
    if (!stel) return;
    const d = stel.MJD2date(stel.observer.utc);
    if (unit === 'year') d.setFullYear(d.getFullYear() + delta);
    if (unit === 'month') d.setMonth(d.getMonth() + delta);
    if (unit === 'day') d.setDate(d.getDate() + delta);
    if (unit === 'hour') d.setHours(d.getHours() + delta);
    if (unit === 'min') d.setMinutes(d.getMinutes() + delta);
    if (unit === 'sec') d.setSeconds(d.getSeconds() + delta);
    stel.observer.utc = stel.date2MJD(d);
    syncTimePopover();
  }

  // --------------------------------------------------------------------------
  // 10. UI SYNC & TELEMETRY LOOP
  // --------------------------------------------------------------------------
  function syncBottomDock() {
    const c = state.core;
    if (!c) return;
    $('btnCstLines').classList.toggle('active', !!c.constellations.lines_visible);
    $('btnCstArt').classList.toggle('active', !!c.constellations.images_visible);
    $('btnAtmo').classList.toggle('active', !!c.atmosphere.visible);
    $('btnLandscape').classList.toggle('active', !!c.landscapes.visible);
    $('btnAzGrid').classList.toggle('active', !!c.lines.azimuthal.visible);
    $('btnEqGrid').classList.toggle('active', !!c.lines.equatorial.visible);
    $('btnDso').classList.toggle('active', !!c.dsos.visible);
    $('btnMilkyWay').classList.toggle('active', !!c.milkyway.visible);
    $('btnNightMode').classList.toggle('active', state.nightMode);
  }

  function syncViewSettingsUI() {
    const c = state.core;
    if (!c) return;
    if (state.hdrPostFx) {
      $('rngHdrBloom').value = state.hdrPostFx.bloomStrength;
      $('lblHdrBloom').textContent = `${Math.round(state.hdrPostFx.bloomStrength * 100)}%`;
      $('rngDiffraction').value = state.hdrPostFx.diffractionStrength;
      $('lblDiffraction').textContent = `${Math.round(state.hdrPostFx.diffractionStrength * 100)}%`;
    }
    $('rngExposure').value = c.exposure_scale;
    $('lblExposure').textContent = `${Number(c.exposure_scale).toFixed(2)}×`;
    $('rngBortle').value = c.bortle_index;
    $('lblBortle').textContent = `Class ${Math.round(c.bortle_index)}`;
    $('rngStarScale').value = c.star_relative_scale;
    $('lblStarScale').textContent = `${Number(c.star_relative_scale).toFixed(2)}×`;
    if (c.meteors) {
      $('rngMeteorsZhr').value = c.meteors.zhr || 0;
      $('lblMeteorsZhr').textContent = `${Math.round(c.meteors.zhr || 0)}/hr`;
    }

    $('chkMilkyWay').checked = !!c.milkyway.visible;
    $('chkDsos').checked = !!c.dsos.visible;
    $('chkSatellites').checked = !!c.satellites.visible;
    $('chkComets').checked = !!c.comets.visible;
    $('chkMinorPlanets').checked = !!c.minor_planets.visible;
    $('chkEcliptic').checked = !!c.lines.ecliptic.visible;
    $('chkMeridian').checked = !!c.lines.meridian.visible;
    $('chkPlanetHints').checked = !!c.planets.hints_visible;
    $('chkBigMoon').checked = c.planets.scale_moon > 1.2;
    $('chkShowFps').checked = state.showFPS;
  }

  function updateHudReadout() {
    const stel = state.stel;
    if (!stel) return;
    const obs = stel.observer;
    const az = (stel.anp(obs.yaw) * R2D).toFixed(1);
    const alt = (obs.pitch * R2D).toFixed(1);
    const fov = (stel.core.fov * R2D).toFixed(1);
    $('hudCoords').innerHTML = `FOV <b>${fov}°</b> &bull; AZ <b>${az}°</b> &bull; ALT <b>${alt >= 0 ? '+' + alt : alt}°</b>`;

    const fpsEl = $('hudFpsBadge');
    if (state.showFPS && typeof stel.core.fps === 'number') {
      fpsEl.classList.add('visible');
      fpsEl.textContent = `${Math.round(stel.core.fps)} FPS`;
    } else {
      fpsEl.classList.remove('visible');
    }
  }

  function updateClockAndDownloads() {
    const stel = state.stel;
    if (!stel) return;
    try {
      const d = stel.MJD2date(stel.observer.utc);
      $('clockTimeMain').textContent = `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
      $('clockDateSub').textContent = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} Local`;
    } catch (_) {}

    const rack = $('stelProgressRack');
    const pbars = stel.core.progressbars;
    if (Array.isArray(pbars) && pbars.length > 0) {
      rack.innerHTML = pbars.slice(0, 4).map((b) => {
        const pct = Math.min(100, Math.max(0, Math.round((b.value / (b.total || 1)) * 100)));
        return `<div class="prog-chip"><span>${b.label || 'Sky Stream'}</span><span class="bar"><i style="width:${pct}%"></i></span></div>`;
      }).join('');
    } else if (rack.childElementCount > 0) {
      rack.innerHTML = '';
    }
  }

  let tickCount = 0;
  function hudLoop() {
    requestAnimationFrame(hudLoop);
    if (!state.stel) return;
    tickCount++;
    if (tickCount % 12 === 0) {
      updateHudReadout();
      updateClockAndDownloads();
    }
    if (tickCount % 30 === 0 && state.selectedObj && $('selectionCard').classList.contains('open')) {
      renderSelectionCard(state.selectedObj);
    }
  }

  // --------------------------------------------------------------------------
  // 11. WIRE ALL INTERACTIONS CLEANLY
  // --------------------------------------------------------------------------
  function wireEvents() {
    // Left Observatory Drawer
    $('btnToggleObserving').addEventListener('click', () => {
      state.drawerOpen = $('obsDrawer').classList.toggle('open');
      $('btnToggleObserving').classList.toggle('active', state.drawerOpen);
      if (state.drawerOpen && state.stel) {
        renderVisibilityTab();
      }
    });
    $('btnCloseDrawer').addEventListener('click', () => {
      state.drawerOpen = false;
      $('obsDrawer').classList.remove('open');
      $('btnToggleObserving').classList.remove('active');
    });

    $('drawerTabs').addEventListener('click', (ev) => {
      const btn = ev.target.closest('button[data-tab]');
      if (!btn) return;
      const tab = btn.dataset.tab;
      document.querySelectorAll('#drawerTabs button').forEach((b) => b.classList.toggle('active', b === btn));
      document.querySelectorAll('#obsDrawer .tab-pane').forEach((p) => p.classList.toggle('active', p.id === tab));
      if (tab === 'paneVisibility') renderVisibilityTab();
      if (tab === 'paneCalendar') loadAstronomicalCalendar();
    });

    // Search
    $('skySearchInput').addEventListener('input', (e) => runSkySearch(e.target.value));
    $('skySearchInput').addEventListener('focus', (e) => {
      if (e.target.value.trim()) runSkySearch(e.target.value);
    });
    $('btnClearSearch').addEventListener('click', () => {
      $('skySearchInput').value = '';
      $('searchResults').classList.remove('open');
      $('btnClearSearch').classList.remove('visible');
    });
    document.addEventListener('click', (ev) => {
      if (!ev.target.closest('.search-box')) $('searchResults').classList.remove('open');
      if (!ev.target.closest('#clockChip') && !ev.target.closest('#timePopover')) {
        state.timePopoverOpen = false;
        $('timePopover').classList.remove('open');
      }
    });

    // Selection Card & Eyepiece FOV
    $('btnCloseCard').addEventListener('click', () => {
      $('selectionCard').classList.remove('open');
      if (state.core) state.core.selection = null;
      $('btnUnlock').style.display = 'none';
    });
    const centerSelectedObj = (durationSec) => {
      if (!state.stel || !state.selectedObj) return;
      if (state.selectedObj.__catalogItem && state.selectedObj.__catalogItem.raDecDeg) {
        const [raD, decD] = state.selectedObj.__catalogItem.raDecDeg;
        state.stel.lookAt(state.stel.s2c(raD * D2R, decD * D2R), durationSec);
      } else {
        state.stel.pointAndLock(state.selectedObj, durationSec);
      }
    };

    $('btnCardTrack').addEventListener('click', () => centerSelectedObj(0.9));
    $('btnCardZoom').addEventListener('click', () => {
      if (!state.stel || !state.selectedObj) return;
      centerSelectedObj(0.9);
      state.stel.zoomTo(2 * D2R, 1.0);
    });
    $('btnEyepieceToggle').addEventListener('click', () => {
      state.eyepieceOn = !state.eyepieceOn;
      $('eyepieceMask').classList.toggle('active', state.eyepieceOn);
      $('btnEyepieceToggle').classList.toggle('active', state.eyepieceOn);
    });
    $('eyepiecePresets').addEventListener('click', (ev) => {
      const btn = ev.target.closest('button[data-fov]');
      if (!btn || !state.stel) return;
      if (state.selectedObj) centerSelectedObj(0.7);
      state.stel.zoomTo(Number(btn.dataset.fov) * D2R, 0.9);
    });

    // 1:1 Millennium Astrophysics Telescope Chamber (Rust WASM + GLSL ES 3.00 + 4K Plate Loupe)
    const setChamberBandMode = (bandVal) => {
      const wantArchive = bandVal === 'archive' && !!state.activePlate;
      document.querySelectorAll('#chBands button').forEach((b) => {
        b.classList.toggle('active', b.dataset.band === (wantArchive ? 'archive' : String(bandVal)));
      });
      if (wantArchive) {
        $('chLoupeStage').classList.add('active');
        $('astroChamberCanvas').style.opacity = '0';
        $('chOverlayHint').textContent = 'Move cursor over plate to inspect with 2x–15x Optical Loupe • Scroll wheel adjusts magnification';
        if (state.astroRenderer) state.astroRenderer.stop();
      } else {
        $('chLoupeStage').classList.remove('active');
        $('chLoupeLens').style.display = 'none';
        $('astroChamberCanvas').style.opacity = '1';
        $('chOverlayHint').textContent = 'Drag to inspect 3D geometry • Scroll to magnify • Illumination locked to ERFA solar phase';
        if (state.astroRenderer) {
          state.astroRenderer.band = Number(bandVal) || 0;
          state.astroRenderer.start();
        }
      }
    };

    const openAstroChamber = () => {
      if (!state.stel || !state.selectedObj || typeof window.MillenniumAstroRenderer !== 'function') return;
      if (!state.astroRenderer) {
        state.astroRenderer = new window.MillenniumAstroRenderer($('astroChamberCanvas'), './engine/exodus_astrophysics_engine.wasm');
      }
      const names = (state.selectedObj.designations && state.selectedObj.designations()) || [];
      const primary = (names[0] || 'Celestial Object').replace(/^NAME\s+/i, '');
      const phys = state.astroRenderer.solveObject(state.stel, state.selectedObj, primary);
      const plate = findArchivalPlate(state.selectedObj, primary);
      state.activePlate = plate;

      $('chTitle').textContent = primary;
      $('chSub').textContent = plate && plate.sglInfo
        ? `${plate.sglInfo.instrument} Clarified Observation + Rust WASM Radiative Solver`
        : (phys.label || 'Millennium Rust WASM + GLSL ES 3.00 Radiative Transfer');

      let html = `
        <div class="ct-box"><span>Shader Kernel</span><b>${['Planck + MHD Corona', 'Rayleigh / Hapke + Rings', 'Sersic + Dust Radiative', 'Volumetric Ha / OIII', 'King Dynamical Profile'][phys.kind]}</b></div>
        <div class="ct-box"><span>Blackbody / Temp</span><b>${Math.round(phys.tempK)} K</b></div>
        <div class="ct-box"><span>Wien Peak (&lambda;max)</span><b>${Math.round(phys.wienNm)} nm</b></div>
      `;
      if (phys.kind === 0) {
        html += `
          <div class="ct-box"><span>Claret Limb (u1, u2)</span><b>${phys.limbU[0].toFixed(2)}, ${phys.limbU[1].toFixed(2)}</b></div>
          <div class="ct-box"><span>Von Zeipel Oblateness</span><b>${(phys.oblate * 100).toFixed(1)}%</b></div>
        `;
      } else if (phys.kind === 1) {
        html += `
          <div class="ct-box"><span>ERFA Solar Phase (&alpha;)</span><b>${phys.solarSidePhaseDeg.toFixed(1)}&deg;</b></div>
          <div class="ct-box"><span>Lit Disc Fraction</span><b>${(phys.litFrac * 100).toFixed(1)}%</b></div>
        `;
      } else {
        html += `
          <div class="ct-box"><span>Sersic / Profile n</span><b>${phys.sersicN.toFixed(2)}</b></div>
          <div class="ct-box"><span>Tilt Inclination</span><b>${(phys.incRad * R2D).toFixed(1)}&deg;</b></div>
        `;
      }
      if (plate && plate.sglInfo) {
        html += `
          <div class="ct-box"><span>Archival Scale</span><b>${plate.sglInfo.dist} &bull; ${plate.sglInfo.scale}</b></div>
        `;
      }
      $('chTelemetry').innerHTML = html;

      const btnArchive = $('btnBandArchive');
      if (plate) {
        btnArchive.style.display = 'inline-flex';
        $('chArchiveImg').src = plate.plateImg;
      } else {
        btnArchive.style.display = 'none';
        $('chArchiveImg').removeAttribute('src');
      }

      state.loupeZoom = 4.0;
      $('rngLoupe').value = '4.0';
      $('lblLoupeZoom').innerHTML = '4.0&times;';
      $('chLoupeTag').textContent = '4.0x LOUPE';
      $('astroChamberModal').classList.add('open');
      setChamberBandMode(plate && plate.preferArchive ? 'archive' : '0');
    };

    $('btnOpenChamber').addEventListener('click', openAstroChamber);
    const closeChamber = () => {
      $('astroChamberModal').classList.remove('open');
      $('chLoupeStage').classList.remove('active');
      $('chLoupeLens').style.display = 'none';
      if (state.astroRenderer) state.astroRenderer.stop();
    };
    $('btnCloseChamber').addEventListener('click', closeChamber);
    $('astroChamberModal').addEventListener('click', (e) => {
      if (e.target === $('astroChamberModal')) closeChamber();
    });
    $('chBands').addEventListener('click', (ev) => {
      const btn = ev.target.closest('button[data-band]');
      if (!btn) return;
      setChamberBandMode(btn.dataset.band);
    });

    // Interactive 2x-15x Optical Loupe Lens for Clarified Observatory Plates
    let lastLoupeEvt = null;
    const updateLoupeLens = (ev) => {
      if (ev) lastLoupeEvt = ev;
      const e = lastLoupeEvt;
      const stage = $('chLoupeStage');
      const img = $('chArchiveImg');
      const lens = $('chLoupeLens');
      if (!e || !stage.classList.contains('active') || !img.getAttribute('src')) {
        lens.style.display = 'none';
        return;
      }
      const sRect = stage.getBoundingClientRect();
      const iRect = img.getBoundingClientRect();
      if (
        e.clientX < iRect.left || e.clientX > iRect.right ||
        e.clientY < iRect.top || e.clientY > iRect.bottom ||
        iRect.width < 10 || iRect.height < 10
      ) {
        lens.style.display = 'none';
        return;
      }
      const zoom = state.loupeZoom;
      const lensW = 176;
      const lensH = 176;
      const relX = e.clientX - iRect.left;
      const relY = e.clientY - iRect.top;
      const stageX = e.clientX - sRect.left;
      const stageY = e.clientY - sRect.top;

      lens.style.display = 'block';
      lens.style.left = `${(stageX - lensW * 0.5).toFixed(1)}px`;
      lens.style.top = `${(stageY - lensH * 0.5).toFixed(1)}px`;
      lens.style.backgroundImage = `url("${img.src}")`;
      lens.style.backgroundSize = `${(iRect.width * zoom).toFixed(1)}px ${(iRect.height * zoom).toFixed(1)}px`;
      lens.style.backgroundPosition = `${(-(relX * zoom - lensW * 0.5)).toFixed(1)}px ${(-(relY * zoom - lensH * 0.5)).toFixed(1)}px`;
      $('chLoupeTag').textContent = `${zoom.toFixed(1)}x LOUPE`;
    };

    $('chLoupeStage').addEventListener('mousemove', updateLoupeLens);
    $('chLoupeStage').addEventListener('mouseleave', () => {
      $('chLoupeLens').style.display = 'none';
    });
    $('chLoupeStage').addEventListener('wheel', (ev) => {
      if (!$('chLoupeStage').classList.contains('active')) return;
      ev.preventDefault();
      const delta = ev.deltaY < 0 ? 0.5 : -0.5;
      state.loupeZoom = Math.max(2.0, Math.min(15.0, state.loupeZoom + delta));
      $('rngLoupe').value = state.loupeZoom.toFixed(1);
      $('lblLoupeZoom').innerHTML = `${state.loupeZoom.toFixed(1)}&times;`;
      updateLoupeLens(ev);
    }, { passive: false });
    $('rngLoupe').addEventListener('input', () => {
      state.loupeZoom = Math.max(2.0, Math.min(15.0, Number($('rngLoupe').value) || 4.0));
      $('lblLoupeZoom').innerHTML = `${state.loupeZoom.toFixed(1)}&times;`;
      $('chLoupeTag').textContent = `${state.loupeZoom.toFixed(1)}x LOUPE`;
      updateLoupeLens();
    });

    // Bottom Dock Toggles
    const bindToggle = (id, getV, setV) => {
      $(id).addEventListener('click', () => {
        if (!state.core) return;
        setV(state.core, !getV(state.core));
        syncBottomDock();
        syncViewSettingsUI();
      });
    };

    bindToggle('btnCstLines', (c) => c.constellations.lines_visible, (c, v) => {
      c.constellations.lines_visible = v;
      c.constellations.labels_visible = v;
    });
    bindToggle('btnCstArt', (c) => c.constellations.images_visible, (c, v) => { c.constellations.images_visible = v; });
    bindToggle('btnAtmo', (c) => c.atmosphere.visible, (c, v) => { c.atmosphere.visible = v; });
    bindToggle('btnLandscape', (c) => c.landscapes.visible, (c, v) => { c.landscapes.visible = v; });
    bindToggle('btnAzGrid', (c) => c.lines.azimuthal.visible, (c, v) => { c.lines.azimuthal.visible = v; });
    bindToggle('btnEqGrid', (c) => c.lines.equatorial.visible, (c, v) => { c.lines.equatorial.visible = v; });
    bindToggle('btnDso', (c) => c.dsos.visible, (c, v) => { c.dsos.visible = v; });
    bindToggle('btnMilkyWay', (c) => c.milkyway.visible, (c, v) => { c.milkyway.visible = v; });

    $('btnNightMode').addEventListener('click', () => {
      state.nightMode = !state.nightMode;
      document.documentElement.dataset.night = state.nightMode ? 'true' : 'false';
      $('nightModeOverlay').classList.toggle('active', state.nightMode);
      syncBottomDock();
    });

    $('btnZoomIn').addEventListener('click', () => {
      if (state.stel) state.stel.zoomTo(Math.max(0.05 * D2R, state.core.fov * 0.62), 0.35);
    });
    $('btnZoomOut').addEventListener('click', () => {
      if (state.stel) state.stel.zoomTo(Math.min(150 * D2R, state.core.fov * 1.45), 0.35);
    });
    $('btnUnlock').addEventListener('click', () => {
      if (!state.core) return;
      state.core.selection = null;
      state.core.lock = null;
      $('btnUnlock').style.display = 'none';
    });
    $('btnResetView').addEventListener('click', () => {
      if (!state.stel) return;
      state.core.selection = null;
      const v = state.stel.convertFrame(state.stel.observer, 'OBSERVED', 'ICRF', state.stel.s2c(165 * D2R, 24 * D2R));
      state.stel.lookAt(v, 0.9);
      state.stel.zoomTo(72 * D2R, 0.9);
    });
    $('btnFullscreen').addEventListener('click', () => {
      const ico = $('icoFullscreen');
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
          if (ico) ico.src = './symbols/ui/fullscreen_exit.svg';
        }).catch(() => {});
      } else {
        document.exitFullscreen().then(() => {
          if (ico) ico.src = './symbols/ui/fullscreen.svg';
        }).catch(() => {});
      }
    });

    // View Settings & Capture
    $('btnCapturePng').addEventListener('click', () => {
      if (state.hdrPostFx) {
        state.hdrPostFx.captureCompositePNG();
      }
    });
    $('btnOpenSettings').addEventListener('click', () => {
      syncViewSettingsUI();
      $('settingsModal').classList.add('open');
    });
    $('btnCloseSettings').addEventListener('click', () => $('settingsModal').classList.remove('open'));
    $('settingsModal').addEventListener('click', (e) => {
      if (e.target === $('settingsModal')) $('settingsModal').classList.remove('open');
    });

    $('rngHdrBloom').addEventListener('input', (e) => {
      if (state.hdrPostFx) { state.hdrPostFx.bloomStrength = Number(e.target.value); syncViewSettingsUI(); }
    });
    $('rngDiffraction').addEventListener('input', (e) => {
      if (state.hdrPostFx) { state.hdrPostFx.diffractionStrength = Number(e.target.value); syncViewSettingsUI(); }
    });
    $('rngMeteorsZhr').addEventListener('input', (e) => {
      if (state.core && state.core.meteors) {
        const v = Number(e.target.value);
        state.core.meteors.visible = v > 0;
        state.core.meteors.zhr = v;
        syncViewSettingsUI();
      }
    });
    $('selDssSurvey').addEventListener('change', (e) => {
      if (!state.core || !state.core.dss) return;
      const val = e.target.value;
      if (val === 'off') {
        state.core.dss.visible = false;
      } else {
        state.core.dss.addDataSource({ url: val });
        state.core.dss.visible = true;
      }
    });
    $('selSkyCulture').addEventListener('change', (e) => {
      const key = e.target.value;
      if (!state.stel) return;
      state.skyCultureKey = key;
      const base = new URL('./', window.location.href).href;
      try {
        state.core.skycultures.addDataSource({ url: `${base}skydata/skycultures/${key}`, key });
      } catch (_) {}
    });
    $('rngExposure').addEventListener('input', (e) => {
      if (state.core) { state.core.exposure_scale = Number(e.target.value); syncViewSettingsUI(); }
    });
    $('rngBortle').addEventListener('input', (e) => {
      if (state.core) { state.core.bortle_index = Number(e.target.value); syncViewSettingsUI(); }
    });
    $('rngStarScale').addEventListener('input', (e) => {
      if (state.core) { state.core.star_relative_scale = Number(e.target.value); syncViewSettingsUI(); }
    });

    const wireChk = (id, fn) => $(id).addEventListener('change', (e) => {
      if (!state.core) return;
      fn(state.core, e.target.checked);
      syncBottomDock();
    });
    wireChk('chkMilkyWay', (c, v) => { c.milkyway.visible = v; });
    wireChk('chkDsos', (c, v) => { c.dsos.visible = v; });
    wireChk('chkSatellites', (c, v) => { c.satellites.visible = v; });
    wireChk('chkComets', (c, v) => { c.comets.visible = v; });
    wireChk('chkMinorPlanets', (c, v) => { c.minor_planets.visible = v; });
    wireChk('chkEcliptic', (c, v) => { c.lines.ecliptic.visible = v; });
    wireChk('chkMeridian', (c, v) => { c.lines.meridian.visible = v; });
    wireChk('chkPlanetHints', (c, v) => { c.planets.hints_visible = v; });
    wireChk('chkBigMoon', (c, v) => { c.planets.scale_moon = v ? 4.0 : 1.0; });
    $('chkShowFps').addEventListener('change', (e) => {
      state.showFPS = e.target.checked;
      updateHudReadout();
    });

    // Observer Location Modal + Presets + GPS
    const presetsGrid = $('locPresetsGrid');
    OBSERVATORIES.forEach((loc) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.innerHTML = `<span>${loc.name}</span><span>${loc.tag}</span>`;
      btn.addEventListener('click', () => applyLocation(loc, false));
      presetsGrid.appendChild(btn);
    });

    $('locChip').addEventListener('click', () => {
      $('locationModal').classList.add('open');
      ensureLeafletMap();
    });
    $('btnCloseLocation').addEventListener('click', () => $('locationModal').classList.remove('open'));
    $('locationModal').addEventListener('click', (e) => {
      if (e.target === $('locationModal')) $('locationModal').classList.remove('open');
    });
    $('btnApplyLatLon').addEventListener('click', () => {
      const lat = Math.max(-89.9, Math.min(89.9, Number($('inpLat').value || 0)));
      const lon = Math.max(-180, Math.min(180, Number($('inpLon').value || 0)));
      const elev = Math.max(-500, Math.min(9000, Number($('inpElev').value || 0)));
      applyLocation({ key: 'manual', name: `Custom (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`, lat, lon, elev }, false);
    });
    $('btnGpsDetect').addEventListener('click', () => {
      if (!navigator.geolocation) return;
      $('btnGpsDetect').textContent = 'Locating...';
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          $('btnGpsDetect').textContent = 'Use My GPS';
          applyLocation({
            key: 'gps',
            name: 'My Real GPS Sky',
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            elev: pos.coords.altitude || 40
          }, false);
        },
        () => { $('btnGpsDetect').textContent = 'GPS Blocked'; },
        { enableHighAccuracy: false, timeout: 6000 }
      );
    });

    // Date & Time Picker Popover
    $('clockChip').addEventListener('click', (e) => {
      e.stopPropagation();
      state.timePopoverOpen = !$('timePopover').classList.contains('open');
      $('timePopover').classList.toggle('open', state.timePopoverOpen);
      if (state.timePopoverOpen) syncTimePopover();
    });

    document.querySelectorAll('#timePopover button[data-unit]').forEach((btn) => {
      btn.addEventListener('click', () => stepDateTime(btn.dataset.unit, Number(btn.dataset.delta)));
    });

    $('tpMinuteSlider').addEventListener('input', (e) => {
      if (!state.stel) return;
      const mins = Number(e.target.value);
      const d = state.stel.MJD2date(state.stel.observer.utc);
      d.setHours(Math.floor(mins / 60), mins % 60, 0, 0);
      state.stel.observer.utc = state.stel.date2MJD(d);
      syncTimePopover();
    });

    $('btnTimeNow').addEventListener('click', () => {
      if (!state.stel) return;
      state.stel.observer.utc = state.stel.date2MJD(new Date());
      state.core.time_speed = 1.0;
      syncTimePopover();
    });
    $('btnTimeDusk').addEventListener('click', () => {
      if (!state.stel) return;
      state.stel.observer.utc = computeEveningTwilightMJD(state.stel);
      syncTimePopover();
    });
    $('btnTimePause').addEventListener('click', () => {
      if (!state.core) return;
      state.core.time_speed = state.core.time_speed === 0 ? 1.0 : 0.0;
      $('btnTimePause').textContent = state.core.time_speed === 0 ? 'Play' : 'Pause';
    });

    $('tpSpeeds').addEventListener('click', (ev) => {
      const btn = ev.target.closest('button[data-speed]');
      if (!btn || !state.core) return;
      state.core.time_speed = Number(btn.dataset.speed);
      document.querySelectorAll('#tpSpeeds button').forEach((b) => b.classList.toggle('active', b === btn));
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    wireEvents();
    bootStellarium();
  });
})();
