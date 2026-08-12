const geolibreProxyTarget = process.env.GEOLIBRE_PROXY_TARGET || 'http://localhost:8091';

module.exports = {
  '/geonetwork': {
    target: 'http://localhost:8080/',
    targeta: 'https://sextant.ifremer.fr/',
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
};
