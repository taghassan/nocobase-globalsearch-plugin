import { Plugin } from '@nocobase/client';
import { GlobalSearchProvider } from './GlobalSearchProvider';
import { GlobalSearchSettings } from './settings/GlobalSearchSettings';

const NAMESPACE = 'plugin-global-search';

export class PluginGlobalSearchClient extends Plugin {
  async load() {
    // Register the header icon + modal via the PinnedPluginList slot
    this.app.use(GlobalSearchProvider);

    // Register the admin settings page under Settings > Global Search
    this.app.pluginSettingsManager.add(NAMESPACE, {
      title: 'Global Search',
      icon: 'SearchOutlined',
      Component: GlobalSearchSettings,
      aclSnippet: `pm.${NAMESPACE}.settings`,
    });
  }
}

export default PluginGlobalSearchClient;
