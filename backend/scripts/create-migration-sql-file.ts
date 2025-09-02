import { readdirSync, statSync, writeFileSync } from "fs";
import { basename, extname, join } from "path";

const DIR = "./src/database/migration";
const filename: string = process.argv[0];

if (!filename) {
  console.error("Please provide a filename");
  process.exit(1);
}

function getNewestFile() {
  const files = readdirSync(DIR);

  let newestFile;
  let newestTime = 0;

  for (const file of files) {
    const filePath = join(DIR, file);
    const stat = statSync(filePath);

    if (stat.mtimeMs > newestTime) {
      newestFile = file;
      newestTime = stat.mtimeMs;
    }
  }

  if (!newestFile) {
    console.error("No files found");
    process.exit(1);
  }

  return newestFile;
}

const newestFile = getNewestFile();

writeFileSync(`${join(DIR, basename(newestFile, extname(newestFile)))}.sql`, "");
