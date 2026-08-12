const geolibreProxyTarget = process.env.GEOLIBRE_PROXY_TARGET || 'http://localhost:8091';

// GeoLibre emits hashed bundle assets under /assets (eg. /assets/foo-ABC12345.js).
// Nested chunk/module requests may have an /assets/... referer rather than /geolibre/,
// so rely on this filename pattern in addition to the referer check.
const isGeoLibreHashedAsset = (url = '') =>
  /^\/assets\/.+-[A-Za-z0-9_-]{6,}\.(js|css|map|wasm|png|svg|webp|json|woff2?|ttf|eot)(\?.*)?$/i.test(
    url,
  );

const isLocalGeoLibreProjectAsset = (url = '') =>
  /^\/assets\/geolibre\/.*\.json(\?.*)?$/i.test(url);

const isGeoLibreReferer = (req) => {
  const referer = req.headers.referer || '';
  return referer.includes('/geolibre');
};

const geolibreAssetProxy = {
  target: geolibreProxyTarget,
  secure: false,
  logLevel: 'debug',
  changeOrigin: true,
  bypass: (req) => {
    if (isLocalGeoLibreProjectAsset(req.url || '')) {
      // Keep local project configuration JSON served by the Angular dev server.
      return req.url;
    }
    if (isGeoLibreReferer(req) || isGeoLibreHashedAsset(req.url || '')) {
      return undefined;
    }
    return req.url;
  },
};

module.exports = {
  '/geonetwork': {
    target: 'https://sextant.ifremer.fr/',
    secure: true,
    logLevel: 'debug',
    changeOrigin: true,
  },
  '/geolibre': {
    target: geolibreProxyTarget,
    secure: false,
    logLevel: 'debug',
    changeOrigin: true,
  },
  '/assets': geolibreAssetProxy,
  '/manifest.webmanifest': geolibreAssetProxy,
  '/geolibre-runtime-config.js': geolibreAssetProxy,
};
