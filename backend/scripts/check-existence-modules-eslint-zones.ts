import fs from "node:fs";
import { exit } from "node:process";

type ESLintConfig = {
  rules: {
    "import/no-restricted-paths": [
      string,
      { zones: { target: string; from: string[]; except?: string[]; message: string }[] },
    ];
  };
};

// eslint-disable-next-line @typescript-eslint/no-var-requires
const eslintConfig = require("../.eslintrc.js") as ESLintConfig;
const modulesFolders = fs.readdirSync("./src/modules");

function checkExistenceOfZones() {
  const zonesTargets = eslintConfig.rules["import/no-restricted-paths"][1].zones.map(
    zone => zone.target
  );

  const foldersWithoutZones = modulesFolders.filter(
    folder => !zonesTargets.find(target => target.includes(folder))
  );

  if (foldersWithoutZones.length) {
    // eslint-disable-next-line no-console
    console.error(
      `Missing zones in .eslintrc.js for modules: ${foldersWithoutZones.join(", ")}. Run "pnpm lint:update-zones" to update zones.`
    );
    exit(1);
  }
  // eslint-disable-next-line no-console
  console.log("All modules have zones in .eslintrc.js");
}

checkExistenceOfZones();
