# NocoBase Global Search Plugin

A custom [NocoBase](https://www.nocobase.com/) plugin that adds a global cross-collection search feature to the admin interface.

## Features

- **Magnifying glass icon** in the admin header — always one click away
- **Search across multiple collections simultaneously** using a configurable LIKE/contains query
- **Results table** with Name, Collection, and a "View Record" button that opens the record detail in a new tab
- **Configurable per-collection URL templates** for the "View Record" link (e.g. `/admin/{pageId}?popupuid={id}`)
- **Admin settings page** for managing which collections are searchable and how their links are constructed

## How It Works

### Architecture

The plugin is a full-stack NocoBase package with both client and server components.

```
src/
├── index.ts                          # Server entry point
├── client/
│   ├── index.tsx                     # Client plugin class
│   ├── GlobalSearchProvider.tsx      # Registers the header icon
│   ├── components/
│   │   ├── GlobalSearchButton.tsx    # Magnifying glass button in the header
│   │   └── GlobalSearchModal.tsx     # Search modal with input + results table
│   └── settings/
│       └── GlobalSearchSettings.tsx  # Admin settings page
└── server/
    ├── index.ts                      # Server plugin class
    ├── collections/
    │   └── global-search-configs.ts  # DB collection for storing search config
    └── resourcers/
        └── global-search.ts          # Custom API endpoint: globalSearch:search
```

### Client Side

1. `PluginGlobalSearchClient.load()` registers `GlobalSearchProvider` as a React provider via `app.use()`.
2. `GlobalSearchProvider` uses NocoBase's `PinnedPluginListProvider` to inject a `GlobalSearchButton` into the admin header icon row, and `SchemaComponentOptions` to make the component available to the schema renderer.
3. Clicking the button opens `GlobalSearchModal` — an Ant Design Modal containing an `Input.Search` and a results `Table`.
4. On search, the modal calls `GET /api/globalSearch:search?q=<query>` via `useAPIClient`. Results are displayed with columns for Name, Collection, and a "View Record" button.
5. The "View Record" URL is built from the per-collection `urlTemplate` stored in the database, with `{id}` replaced by the record's primary key.

### Server Side

1. `PluginGlobalSearchServer.load()` registers a custom resource (`globalSearch`) with a `search` action, and sets ACL rules to allow authenticated users to call it.
2. The `search` action reads enabled configurations from the `globalSearchConfigs` collection, then runs a parallel `$includes` (LIKE) query against each configured collection's search field.
3. Results from all collections are merged into a flat array and returned. NocoBase's `dataWrapping` middleware automatically wraps the response into `{ data: [...] }`.
4. CRUD access to `globalSearchConfigs` is allowed for admin users so the settings page can manage configurations.

### Settings Page

Registered under **Settings → Global Search** via `pluginSettingsManager.add()`. Admins can:
- Add collections to the search index (choosing from all available collections)
- Set a display name, the field to search on, and the URL template for "View Record" links
- Enable/disable individual collections
- Edit or remove configurations

## Compatibility

| Plugin version | NocoBase version |
|---|---|
| 2.0.0 | 2.0.41+ |

> **Note:** This plugin was developed and tested against NocoBase **v2.0.41**. It is not compatible with earlier versions (notably v2.0.8 and below) due to internal API differences in `@nocobase/client`.

## Installation

### Option 1: Upload via Plugin Manager UI (recommended)

1. Download the pre-built `.tgz` from the [Releases](../../releases) page (or from the `plugin-global-search-2.0.0.tgz` file in this repo).
2. In your NocoBase admin UI, go to **Settings → Plugin Manager**.
3. Click **Add plugin → Upload local plugin** and select the `.tgz` file.
4. Click **Activate**.
5. Do a hard refresh (`Cmd+Shift+R` / `Ctrl+Shift+R`) to ensure the browser loads the new client bundle.

### Option 2: Build from source

Requires the full NocoBase monorepo development environment.

```bash
# Clone the NocoBase monorepo and place this plugin under:
# packages/plugins/@nocobase/plugin-global-search/

# Install dependencies
yarn install

# Build the plugin
yarn build @nocobase/plugin-global-search

# Package it as a .tgz for upload
yarn nocobase tar @nocobase/plugin-global-search
# → creates storage/tar/@nocobase/plugin-global-search-2.0.0.tgz
```

Then follow Option 1 to install the generated `.tgz`.

## Configuration

After activation:

1. Go to **Settings → Global Search**.
2. Click **Add Collection** to configure a collection for search.
3. For each collection, set:
   - **Collection** — select from your existing NocoBase collections
   - **Display Name** — label shown in search results (e.g. "Customers")
   - **Search Field** — the field name to run the LIKE query against (e.g. `name`, `title`)
   - **URL Template** — the path opened when "View Record" is clicked. Use `{id}` as a placeholder for the record's primary key. Example: `/admin/your-page-id?popupuid={id}`
   - **Enabled** — toggle to include/exclude from search without deleting the config

## License

Apache-2.0
