import "tsconfig-paths/register"; // required for migrations
import "dotenv/config";

module.exports = {
  client: "pg",
  connection: process.env.DATABASE_URL,
  migrations: {
    directory: "src/database/migration",
    loadExtensions: [".ts", ".js"],
    stub: "src/database/migration.template.ts",
  },
};
