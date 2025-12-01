# Sextant frontend

## User interface configuration

...   ...

## Theming

Application theme is defined in [app.theme.ts](projects/main/src/app/app.theme.ts). It relies on https://primeng.org/theming.

Different levels of theming are available:
* Theme configuration in `app.theme.ts` (colors, components default styles, etc.)
    * primitive for colors, radius
    * semantic for color scheme
    * components for component specific styles
* [Scoped tokens](https://primeng.org/theming#scopedtokens) can then be used in components if a particular style needs to be overridden
* [Pass through](https://primeng.org/passthrough) can be used to pass arbitrary attributes to underlying DOM elements (eg. adding CSS classes) (see `search-input`)

The current theme is based on PrimeUIX Aura preset. See https://github.com/primefaces/primeuix/tree/main/packages/themes/src/presets/aura

Font family is set to "Inter" and can be customized with `--app-font-family-sans`.


## Development

To set up the development environment and start the main app, run the following commands:

```sh
nvm use v22.19.0
npm install
npm run build 
npm run start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`.

Use the following command to watch for library changes and rebuild automatically:

```sh
npm run watch-lib
```

### Running tests

...


## GeoNetwork API

### Building GeoNetwork API client

GeoNetwork 4 and 5 provides an Open API specification that can be used to generate API clients. See
* http://localhost:8080/geonetwork/doc/api/ for GeoNetwork 4
* https://apps.titellus.net/geonetwork/doc/api/swagger-ui/index.html for GeoNetwork 5


To build GeoNetwork API client, run:

```sh
npm run download-api-geonetwork4-client
npm run build-api-geonetwork4-client
npm run prettier
```

The search service does not use Elasticsearch types so for now, we need to modify the generated code a bit.

In `search.services.ts`, add
```ts
import { IndexRecord, elasticsearch } from 'gn-api-client';
public msearch(
  -    body: elasticsearch.SearchRequest,
  +    body: string,

  -  ): Observable<
-    HttpEvent<
-      elasticsearch.SearchResponse<IndexRecord, Record<string, elasticsearch.AggregationsAggregate>>
-    >
-  >;
+  ): Observable<HttpEvent<string>>;
```
TODO: automate this step


### Improvement of the Open API documentation

Ongoing PR to improve GeoNetwork Open API documentation:
* https://github.com/geonetwork/core-geonetwork/pull/9106
* https://github.com/geonetwork/core-geonetwork/pull/8602




