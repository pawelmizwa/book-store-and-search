const fs = require("fs");
const path = require("path");

function getPublicEnvs() {
  return Object.keys(process.env)
    .filter((key) => /^NEXT_PUBLIC_/i.test(key))
    .reduce((env, key) => ({ ...env, [key]: process.env[key] }), {});
}

function createScriptContent(env) {
  return `window.__ENV = ${JSON.stringify(env)};`;
}

function createPublicEnvFile(env, subdirectory = "") {
  const base = fs.realpathSync(process.cwd());
  const file = `${base}/public/${subdirectory}__ENV.js`;
  const content = createScriptContent(env);
  const dirname = path.dirname(file);

  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
  fs.writeFileSync(file, content);
}

(() => {
  const publicEnv = getPublicEnvs();
  createPublicEnvFile(publicEnv);
})();
