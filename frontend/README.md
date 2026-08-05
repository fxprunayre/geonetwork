# Sextant frontend

## User interface configuration

The user interface functionality and layout can be extensively configured using a central JSON configuration object. 

This configuration object defines the behavior of various modules (apps) and global UI settings:

* **Global Settings:** Properties like `proxyUrl`, `bannerBackground`, `bannerTitle`, `bannerSubTitle`, and `theme`.
* **Apps/Modules Configurations:**
  * `home`: Settings for the home page (e.g., featured records, statistics).
  * `search`: Search capabilities, facets, sorting options, and pagination settings.
  * `record`: Record details view layout and visible metadata sections.
  * `map`: Map configuration, including default projections and background layers.
  * `menu`: Navigation menu links and availability.
  * `authentication`: Login and user profile settings.
  * `i18n`: Internationalization and language settings.

**How to provide the configuration:**

Via the `config` property of the `<sextant-app>` Web Component:

1. **Configuration ID:** The app retrieves the configuration using a specific configuration identifier using `srv/api/ui/{configId}`
2. **Inline Configuration:** You can pass a JSON configuration string directly to the application. This overrides the default layout and backend configuration natively.



## Theming

The application theme is defined in [`app.theme.ts`](projects/main/src/app/app.theme.ts) and is built on top of the [PrimeNG Theming framework](https://primeng.org/theming).

The current theme uses the **PrimeUIX Aura preset** as its foundation. For more details on the Aura preset, see the [PrimeUIX repository](https://github.com/primefaces/primeuix/tree/main/packages/themes/src/presets/aura).

### Customization Levels

You can customize the application style at different levels depending on your needs:

1. **Global Theme Configuration (`app.theme.ts`)**:
   Modify the core setup to change the look and feel globally.
   - **Primitive:** Base tokens for raw values like colors and border radii.
   - **Semantic:** Abstractions like color schemes (e.g., primary, surface) adaptable for light/dark modes.
   - **Components:** Default styles applied at the component level across the app.

2. **Scoped Tokens**:
   Use [PrimeNG Scoped Tokens](https://primeng.org/theming#scopedtokens) within specific angular components to override global styles locally without affecting the rest of the application.

3. **Pass Through (PT)**:
   Use the [PrimeNG Pass Through](https://primeng.org/passthrough) feature to pass arbitrary attributes or CSS classes directly to underlying DOM elements of PrimeNG components (e.g., see the `search-input` implementation).

### Typography

The default font family is set to **"Inter"**.
You can customize it by overriding the CSS variable `--app-font-family-sans` in your styles.


## Embedding

See [`test-wc.html`](test-wc.html)

To embed the application as a Web Component in any HTML page, import the built javascript and css files and use the `<sextant-app>` tag:

```html
<script src="sextant-app.js" type="module"></script>
<link rel="stylesheet" href="dist/webcomponent/browser/styles.css" />

<sextant-app></sextant-app>
```

### Bundle Name Configuration

The generated web component entry bundle name is configured from `bundleName` in the Angular environment files `projects/library/src/environments/environment*.ts`.

Build scripts call `scripts/rename-main-bundle.js`, which reads `bundleName` and renames the generated `main*.js` bundle accordingly.

If you change `bundleName`, update your embedding snippet to load the same file name:

```html
<script src="<your-bundle-name>.js" type="module"></script>
```

### Properties

The `<sextant-app>` Web Component accepts the following properties (attributes):

* `url`: (Optional) The base URL of the GeoNetwork API catalogue (e.g., `https://mycatalogue.com/geonetwork`). Falls back to the environment configuration if not provided.
* `language`: (Optional) The default language to use, typically in 3-letter ISO code format (e.g., `eng`, `fre`).
* `space`: (Optional) The specific configuration space ID to load (e.g. `srv`, `inspire`).
* `config`: (Optional) A JSON string holding an inline configuration object to override the default application settings or a configuration ID.

### Examples

**Basic embedding with specific URL and language:**
```html
<sextant-app url="https://demo.geocat.live/catalogue" language="fre"></sextant-app>
```

**Embedding with specific space and inline configuration:**

#### Target a space to reduce search scope

```html
<sextant-app
  url="/geonetwork"
  space="AMBIO"
></sextant-app>
```

#### Configure language

```html
<sextant-app
  url="/geonetwork"
  space="AMBIO"
  language="fre"
></sextant-app>
```

#### Use a registered UI configuration

```html
<sextant-app
  url="/geonetwork"
  space="AMBIO"
  language="fre"
  config="sextant-home"
></sextant-app>
```


#### Disable home and menu to focus on search

```html
<sextant-app
  url="/geonetwork"
  space="AMBIO"
  config='{"config": {"apps": {"home": {"enabled": false}, "menu": {"enabled": false}}}}'
></sextant-app>
```

#### Changing results layout

```html
<sextant-app
  url="/geonetwork"
  space="AMBIO"
  config='{"config": {"apps": {
    "home": {"enabled": false}, 
    "menu": {"enabled": false}, 
    "search": {"resultsLayoutOptions": ["grid"]}
  }}}'
></sextant-app>
```


#### Customizing the banner

```html
<sextant-app
  url="/geonetwork"
  space="AMBIO"
  config='{"config": {
    "apps": {
      "menu": {"enabled": false}, 
      "home": {"enabled": false}, 
      "map": {"enabled": false}, 
      "search": {"resultsLayoutOptions": ["grid"]}
    },
    "bannerBackground":"#FFF","bannerTitle":"","bannerSubTitle":"","bannerTextColor":"#333","font":"Courier"
  }}'
></sextant-app>
```


#### Customizing colors

```html
<sextant-app
  url="/geonetwork"
  space="AMBIO"
  config='{"config": {
    "apps": {
      "menu": {"enabled": false}, 
      "home": {"enabled": false}, 
      "map": {"enabled": false}, 
      "search": {"resultsLayoutOptions": ["grid"]}
    },
    "theme": {
      "primitive":{
        "myprimary":{"50":"#f2fafe","100":"#c2e9f8","200":"#91d7f3","300":"#61c6ee","400":"#30b4e8","500":"#00a3e3","600":"#008bc1","700":"#00729f","800":"#005a7d","900":"#00415b","950":"#002939"}
      },
      "semantic":{
        "colorScheme":{
          "light":{
            "primary":{"color":"{myprimary.500}"}
          },
          "text":{
            "color":"{myprimary.800}",
            "hoverColor":"{surface.800}"
          }
        }
      }
    },
    "bannerBackground":"#FFF","bannerTitle":"","bannerSubTitle":"","bannerTextColor":"#333","font":"Courier"
  }}'
></sextant-app>
```




### WebComponent mode

#### Authentication and Cookies (CAS/OpenID)

The web component uses browser session cookies to restore authentication (for example via the `me` endpoint after CAS/OpenID redirect).

In [`ApplicationConfig`](projects/main/src/app/app.config.ts), API clients are configured with `withCredentials` via the `API_WITH_CREDENTIALS` constant.

Keep this enabled when:

* the web component and GeoNetwork API are on different origins, and
* you rely on session-based authentication (CAS, OpenID Connect, sign-in redirect).

Server/browser prerequisites for cross-origin cookies:

* CORS allows credentials (`Access-Control-Allow-Credentials: true`),
* CORS allows the embedding origin (not `*`),
* session cookies are compatible with cross-site requests (typically `SameSite=None; Secure`).

If your deployment is strictly same-origin and does not need cookies on API calls, this can be disabled.

#### Testing

To test the app in a third party page, use:

```
npx http-server .
```

Then access:

* http://localhost:8081/projects/main/src/assets/test/odatis.html or 
* http://localhost:8081/projects/main/src/assets/test/sextant.html


#### Routing

By default angular use `PathLocationStrategy` with `/`. When embedding the webcomponent in another site which does not set redirection for location path, this strategy will not work when accessing the application with a non root path.


In such case, 2 options:

* `ApplicationConfig` use an in memory strategy
```
{ provide: LocationStrategy, useClass: InMemoryLocationStrategy }
```

* Use the `HashLocationStrategy` (default)


See [`ApplicationConfig`](projects/main/src/app/app.config.ts) for configuration of the strategy.

`HashLocationStrategy` may not be the best option for SEO (to be investigated).


# Development

## Setup

To set up the development environment and start the main app, run the following commands:

```sh
nvm use v22.19.0
npm install --legacy-peer-deps
npm run build 
npm run start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`.

Use the following command to watch for library changes and rebuild automatically:

```sh
npm run watch-lib
```



### Running tests

Unit tests:

```sh
npm run test
```

End-to-end tests:

```sh
# Run tests in interactive mode (opens Cypress UI)
npm run e2e:start

# Run tests in headless mode (CI)
npm run e2e:ci
```

E2E tests are running with live version of the catalogue with some static [fixtures](cypress/fixtures/).

To update static fixtures use (eg. when changing aggregations config): 

```bash
cd cypress/fixtures
./fixtures-from-requests.sh
```

To configure Cypress see [configuration file](cypress.config.ts).


### Configuring catalogue API endpoint

In [`proxy.config.js`](proxy.config.js), update or change API endpoint eg.

```js
  '/catalogue': {
    target: 'https://demo.geocat.live',
    secure: true,
    logLevel: 'debug',
    changeOrigin: true,
  }
```

If not using `geonetwork` base path, also update the [`environments.ts`](projects/library/src/environments/environment.ts) eg.

```js
export const environment = {
  production: false,
  geonetworkApiUrl: '/catalogue',
```


## GeoNetwork API

### Building GeoNetwork API client

GeoNetwork 4 and 5 provides an Open API specification that can be used to generate API clients. See
* http://localhost:8080/geonetwork/doc/api/ for GeoNetwork 4
* http://localhost:8080/geonetwork/doc/api/swagger-ui/index.html for GeoNetwork 5


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



### Component Templates

Template placement follows a simple rule:

* Use inline templates for small leaf or utility components where the markup is short, stable, and tightly coupled to a few local bindings.
* Keep a separate `.html` file for components with larger layout structure, multiple branches, many child components, or templates that are likely to grow.

In practice, inline templates are preferred for wrappers, counters, badges, and other compact UI helpers. External templates are preferred for orchestrators, result cards, panels, tables, and record/search views.


# Deployment guide

For Apache, you need to activate the rewrite module:

```bash
a2enmod rewrite
systemctl restart apache2
```

Then add the following lines in an `.htaccess` file alongside the application `index.html` file:

```apache2
RewriteEngine on
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]
RewriteRule ^ ./index.html
```

# Misc

## Checking for circular dependency

```
npx madge --circular --extensions ts .
```

If build return:
```
Entry point gn-library has a circular dependency on itself.
```
Search for `from 'gn-library'` in the module.


### Build error

```
Cannot destructure property 'pos' of 'file.referencedFiles[index]' as it is unde
```
This is usually due to import statements not using paths eg.
```
import { RecordsService } from '../../../../../../gn4-api-client/src/public-api';
```

