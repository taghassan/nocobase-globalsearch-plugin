import { defineCollection } from '@nocobase/database';

export default defineCollection({
  name: 'globalSearchConfigs',
  shared: true,
  dumpRules: 'required',
  migrationRules: ['overwrite', 'schema-only'],
  fields: [
    {
      type: 'string',
      name: 'collectionName',
      unique: true,
      allowNull: false,
    },
    {
      type: 'string',
      name: 'displayName',
    },
    {
      // The field on the target collection to run the LIKE query against
      type: 'string',
      name: 'searchField',
      defaultValue: 'name',
    },
    {
      // e.g. "/admin/some-page-id?popupuid={id}"
      type: 'string',
      name: 'urlTemplate',
    },
    {
      type: 'boolean',
      name: 'enabled',
      defaultValue: false,
    },
  ],
});
