import { readFile } from 'node:fs/promises';

const [packageJson, packageLock, tauriConfig, cargoToml] = await Promise.all([
  readJson('package.json'),
  readJson('package-lock.json'),
  readJson('src-tauri/tauri.conf.json'),
  readFile('src-tauri/Cargo.toml', 'utf8')
]);

const failures = [];
const expected = {
  packageName: 'cheat-dock',
  productName: 'Cheat Dock',
  identifier: 'dev.cheatdock.app',
  minimumSystemVersion: '10.15'
};

const authoritativeVersion = tauriConfig.version;
const cargoVersion = cargoPackageVersion(cargoToml);
const lockRoot = packageLock.packages?.[''];

expect(typeof authoritativeVersion === 'string' && /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(authoritativeVersion), 'tauri.conf.json version must be SemVer-like');
expect(packageJson.name === expected.packageName, `package.json name must be ${expected.packageName}`);
expect(packageJson.version === authoritativeVersion, 'package.json version must match tauri.conf.json version');
expect(lockRoot?.version === authoritativeVersion && packageLock.version === authoritativeVersion, 'package-lock.json root versions must match tauri.conf.json version');
expect(cargoVersion === authoritativeVersion, 'src-tauri/Cargo.toml package version must match tauri.conf.json version');
expect(tauriConfig.productName === expected.productName, `productName must remain ${expected.productName}`);
expect(tauriConfig.identifier === expected.identifier, `bundle identifier must remain ${expected.identifier}; changing it relocates app_data_dir`);
expect(Array.isArray(tauriConfig.bundle?.targets) && ['app', 'dmg'].every((target) => tauriConfig.bundle.targets.includes(target)), 'bundle targets must include app and dmg');
expect(tauriConfig.bundle?.macOS?.hardenedRuntime === true, 'bundle.macOS.hardenedRuntime must be explicitly true');
expect(tauriConfig.bundle?.macOS?.minimumSystemVersion === expected.minimumSystemVersion, `minimum macOS version must be explicitly ${expected.minimumSystemVersion}`);
expect(tauriConfig.bundle?.macOS?.signingIdentity === undefined, 'do not commit a signing identity; provide APPLE_SIGNING_IDENTITY at release time');
expect(tauriConfig.bundle?.macOS?.entitlements === undefined, 'v0.1 does not require custom macOS entitlements');

if (failures.length) {
  console.error('Release identity check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(JSON.stringify({
  productName: tauriConfig.productName,
  executableName: packageJson.name,
  identifier: tauriConfig.identifier,
  version: authoritativeVersion,
  minimumSystemVersion: tauriConfig.bundle.macOS.minimumSystemVersion,
  hardenedRuntime: tauriConfig.bundle.macOS.hardenedRuntime,
  bundles: tauriConfig.bundle.targets
}, null, 2));

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

function cargoPackageVersion(toml) {
  const packageSection = toml.match(/\[package\]([\s\S]*?)(?:\n\[|$)/)?.[1] ?? '';
  return packageSection.match(/^version\s*=\s*"([^"]+)"/m)?.[1];
}

function expect(condition, message) {
  if (!condition) failures.push(message);
}
