# GeoLibre Service Image

This image builds GeoLibre from source with a base path of `/geolibre/`.

Why:
- It avoids root-level `/assets/*` requests from the iframe app.
- It keeps GeoLibre requests scoped to `/geolibre/*`, which simplifies frontend proxying.

## Build args

- `GEOLIBRE_REF` (default `main`): git branch/tag/ref to build from.

## Build manually

```bash
docker build -t geolibre-local-basepath services/geolibre --build-arg GEOLIBRE_REF=main
```

## Run manually

```bash
docker run --rm -p 8091:80 \
  -e GEOLIBRE_EMBED_ORIGINS='http://localhost:4200,http://127.0.0.1:4200' \
  geolibre-local-basepath
```

Then use iframe/embed URL `/geolibre/?embed=1` through the frontend dev proxy.
