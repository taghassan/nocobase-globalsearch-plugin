import { Context, Next } from '@nocobase/actions';

export default {
  name: 'globalSearch',
  actions: {
    async search(ctx: Context, next: Next) {
      const { q } = ctx.action.params;

      if (!q || String(q).trim().length < 2) {
        // Set a plain array — dataWrapping middleware will wrap it to { data: [] }
        ctx.body = [];
        return next();
      }

      const query = String(q).trim();

      // Load all enabled search configs
      const configs = await ctx.db.getRepository('globalSearchConfigs').find({
        filter: { enabled: true },
      });

      if (!configs.length) {
        ctx.body = [];
        return next();
      }

      // Query each configured collection in parallel
      const resultSets = await Promise.all(
        configs.map(async (config) => {
          const collectionName: string = config.get('collectionName') as string;
          const searchField: string = (config.get('searchField') as string) || 'name';
          const displayName: string = (config.get('displayName') as string) || collectionName;
          const urlTemplate: string = (config.get('urlTemplate') as string) || '';

          try {
            const repo = ctx.db.getRepository(collectionName);
            if (!repo) {
              return [];
            }

            const rows = await repo.find({
              filter: { [searchField]: { $includes: query } },
              limit: 20,
            });

            return rows.map((row) => ({
              id: row.get('id'),
              name: row.get(searchField) ?? row.get('id'),
              collectionName,
              displayName,
              urlTemplate,
            }));
          } catch {
            // Collection may not exist yet or field may be invalid — skip gracefully
            return [];
          }
        }),
      );

      // Set a plain array — dataWrapping middleware wraps it to { data: [...] }
      ctx.body = resultSets.flat();
      return next();
    },
  },
};
