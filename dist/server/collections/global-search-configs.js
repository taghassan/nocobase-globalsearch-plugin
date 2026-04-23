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
var global_search_configs_exports = {};
__export(global_search_configs_exports, {
  default: () => global_search_configs_default
});
module.exports = __toCommonJS(global_search_configs_exports);
var import_database = require("@nocobase/database");
var global_search_configs_default = (0, import_database.defineCollection)({
  name: "globalSearchConfigs",
  shared: true,
  dumpRules: "required",
  migrationRules: ["overwrite", "schema-only"],
  fields: [
    {
      type: "string",
      name: "collectionName",
      unique: true,
      allowNull: false
    },
    {
      type: "string",
      name: "displayName"
    },
    {
      // The field on the target collection to run the LIKE query against
      type: "string",
      name: "searchField",
      defaultValue: "name"
    },
    {
      // e.g. "/admin/some-page-id?popupuid={id}"
      type: "string",
      name: "urlTemplate"
    },
    {
      type: "boolean",
      name: "enabled",
      defaultValue: false
    }
  ]
});
