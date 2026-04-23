import { Plugin } from '@nocobase/server';
import globalSearchResource from './resourcers/global-search';

export class PluginGlobalSearchServer extends Plugin {
  async load() {
    // Register the custom cross-collection search resource
    this.app.resourceManager.define(globalSearchResource);

    // Any logged-in user may call the search action
    this.app.acl.allow('globalSearch', 'search', 'loggedIn');

    // Only admins/root manage the settings collection;
    // the built-in CRUD resource for globalSearchConfigs is available automatically.
    // Using 'loggedIn' here and restricting further via the settings page aclSnippet on the client.
    this.app.acl.allow('globalSearchConfigs', ['list', 'get', 'create', 'update', 'destroy'], 'loggedIn');
  }
}

export default PluginGlobalSearchServer;
