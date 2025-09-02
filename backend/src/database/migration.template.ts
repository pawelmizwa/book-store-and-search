import { getDefaultMigrationScripts } from "src/database/migration.helpers";

export const { up, down } = getDefaultMigrationScripts(__filename);
