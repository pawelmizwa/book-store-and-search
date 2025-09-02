import fs from "node:fs";

type EsLintConfig = {
  rules: {
    "import/no-restricted-paths": [
      string,
      { zones: { target: string; from: string[]; except?: string[]; message: string }[] },
    ];
  };
};

// eslint-disable-next-line @typescript-eslint/no-var-requires
const eslintConfig = require("../.eslintrc.js") as EsLintConfig;

const modulesFolders = fs.readdirSync("./src/modules");

function updateEslintZones() {
  modulesFolders.forEach(async folder => {
    const zones = eslintConfig.rules["import/no-restricted-paths"][1].zones;
    const zonesTargets = zones.map(zone => zone.target);

    // Get the folders that already have a rule
    const foldersWithExistingRule = modulesFolders.filter(folder => {
      if (zonesTargets.some(target => target.includes(folder))) {
        return folder;
      }
    });

    // If the folder does not have a rule, create a new one
    if (!foldersWithExistingRule.includes(folder)) {
      const extendedExcept = zones.map(zone => {
        if (zone.except) {
          return {
            ...zone,
            except: zone.except.concat(`./${folder}/index.ts`),
          };
        }
        return zone;
      });

      const newZone = {
        target: `./src/modules/${folder}`,
        from: ["./src/modules"],
        except: [...foldersWithExistingRule.map(folder => `./${folder}/index.ts`), `./${folder}`],
        message:
          "You should not import between modules directly - use only what is exported from index instead",
      };

      const newZones = [...extendedExcept, newZone];

      const newEslintrc = {
        ...eslintConfig,
        rules: {
          ...eslintConfig.rules,
          "import/no-restricted-paths": [
            "error",
            {
              zones: newZones,
            },
          ],
        },
      };

      fs.writeFileSync(
        "./.eslintrc.js",
        `module.exports = ${JSON.stringify(newEslintrc, null, 2)}`
      );
    }
  });
}

updateEslintZones();
