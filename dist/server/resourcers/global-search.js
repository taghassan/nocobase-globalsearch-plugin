var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var global_search_exports = {};
__export(global_search_exports, {
  default: () => global_search_default
});
module.exports = __toCommonJS(global_search_exports);
var global_search_default = {
  name: "globalSearch",
  actions: {
    async search(ctx, next) {
      const { q } = ctx.action.params;
      if (!q || String(q).trim().length < 2) {
        ctx.body = [];
        return next();
      }
      const query = String(q).trim();
      const configs = await ctx.db.getRepository("globalSearchConfigs").find({
        filter: { enabled: true }
      });
      if (!configs.length) {
        ctx.body = [];
        return next();
      }
      const resultSets = await Promise.all(
        configs.map(async (config) => {
          const collectionName = config.get("collectionName");
          const searchField = config.get("searchField") || "name";
          const displayName = config.get("displayName") || collectionName;
          const urlTemplate = config.get("urlTemplate") || "";
          try {
            const repo = ctx.db.getRepository(collectionName);
            if (!repo) {
              return [];
            }
            const rows = await repo.find({
              filter: { [searchField]: { $includes: query } },
              limit: 20
            });
            return rows.map((row) => ({
              id: row.get("id"),
              name: row.get(searchField) ?? row.get("id"),
              collectionName,
              displayName,
              urlTemplate
            }));
          } catch {
            return [];
          }
        })
      );
      ctx.body = resultSets.flat();
      return next();
    }
  }
};
