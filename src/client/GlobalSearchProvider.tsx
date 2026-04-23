import React from 'react';
import { PinnedPluginListProvider, SchemaComponentOptions } from '@nocobase/client';
import { GlobalSearchButton } from './components/GlobalSearchButton';

export const GlobalSearchProvider: React.FC<{ children?: React.ReactNode }> = (props) => {
  return (
    <PinnedPluginListProvider
      items={{
        globalSearch: { order: 100, component: 'GlobalSearchButton', pin: true, snippet: '*' },
      }}
    >
      <SchemaComponentOptions components={{ GlobalSearchButton }}>{props.children}</SchemaComponentOptions>
    </PinnedPluginListProvider>
  );
};
