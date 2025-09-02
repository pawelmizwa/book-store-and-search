import { readFile } from "fs/promises";
import { Knex } from "knex";
import { basename, dirname, extname, join } from "path";

export async function upDefault(knex: Knex, filePath: string): Promise<void> {
  const sql = await readFile(
    `${join(dirname(filePath), basename(filePath, extname(filePath)))}.sql`,
    "utf8"
  );
  await knex.raw(sql);
}

export async function downDefault(): Promise<void> {
  throw new Error("Don't do down migrations!");
}

export function getDefaultMigrationScripts(filePath: string) {
  return {
    up: (knex: Knex) => upDefault(knex, filePath),
    down: downDefault,
  };
}
