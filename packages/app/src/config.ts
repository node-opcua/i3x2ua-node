import { cosmiconfig } from 'cosmiconfig';
import { load as loadYaml } from 'js-yaml';

export interface I3xConfig {
  endpoint: string;
  port: number;
  host: string;
  securityMode: string;
  optimizedClient: 'auto' | 'disabled';
  subscriptionInterval: number;
  logLevel: string;
  modelPreload: boolean;
  failOnPreloadError: boolean;
  username?: string;
  password?: string;
}

const DEFAULTS: I3xConfig = {
  endpoint: 'opc.tcp://localhost:4840',
  port: 8080,
  host: '0.0.0.0',
  securityMode: 'None',
  optimizedClient: 'auto',
  subscriptionInterval: 5,
  logLevel: 'info',
  modelPreload: true,
  failOnPreloadError: false,
};

// ── Environment variable helpers ───────────────────────────
function envStr(key: string): string | undefined {
  return process.env[key];
}
function envInt(key: string): number | undefined {
  const v = process.env[key];
  return v ? parseInt(v, 10) : undefined;
}
function envBool(key: string): boolean | undefined {
  const v = process.env[key];
  if (!v) return undefined;
  return v === '1' || v.toLowerCase() === 'true';
}

function fromEnv(): Partial<I3xConfig> {
  const result: Partial<I3xConfig> = {};
  const endpoint = envStr('I3X_OPCUA_ENDPOINT') ?? envStr('I3X_ENDPOINT');
  if (endpoint) result.endpoint = endpoint;

  const port = envInt('I3X_PORT');
  if (port !== undefined) result.port = port;

  const host = envStr('I3X_HOST');
  if (host) result.host = host;

  const securityMode = envStr('I3X_OPCUA_SECURITY_MODE');
  if (securityMode) result.securityMode = securityMode;

  const optimizedClient = envStr('I3X_OPCUA_OPTIMIZED_CLIENT');
  if (optimizedClient === 'auto' || optimizedClient === 'disabled')
    result.optimizedClient = optimizedClient;

  const interval = envInt('I3X_SUBSCRIPTION_INTERVAL_SECONDS');
  if (interval !== undefined) result.subscriptionInterval = interval;

  const logLevel = envStr('I3X_LOG_LEVEL');
  if (logLevel) result.logLevel = logLevel;

  const preload = envBool('I3X_MODEL_PRELOAD_ON_STARTUP');
  if (preload !== undefined) result.modelPreload = preload;

  const failOnPreload = envBool('I3X_FAIL_STARTUP_ON_MODEL_PRELOAD_ERROR');
  if (failOnPreload !== undefined) result.failOnPreloadError = failOnPreload;

  const username = envStr('I3X_OPCUA_USERNAME');
  if (username) result.username = username;

  const password = envStr('I3X_OPCUA_PASSWORD');
  if (password) result.password = password;

  return result;
}

// ── Config file discovery ──────────────────────────────────
export async function resolveConfig(
  cliArgs: Partial<I3xConfig>,
  configPath?: string,
): Promise<I3xConfig> {
  // 1. Load config file (i3x.config.yml, i3x.config.json, ...)
  let fileConfig: Partial<I3xConfig> = {};
  const explorer = cosmiconfig('i3x', {
    searchPlaces: [
      'i3x.config.yml',
      'i3x.config.yaml',
      'i3x.config.json',
      '.i3xrc',
      '.i3xrc.json',
      '.i3xrc.yml',
      '.i3xrc.yaml',
      'package.json',
    ],
    loaders: {
      '.yml': (_filepath: string, content: string) => loadYaml(content),
      '.yaml': (_filepath: string, content: string) => loadYaml(content),
    },
  });

  try {
    const result = configPath ? await explorer.load(configPath) : await explorer.search();
    if (result && !result.isEmpty) {
      fileConfig = result.config as Partial<I3xConfig>;
    }
  } catch {
    // No config file found -- that's fine
  }

  // 2. Layer: defaults < config file < env vars < CLI args
  const envConfig = fromEnv();

  return {
    ...DEFAULTS,
    ...fileConfig,
    ...envConfig,
    ...cliArgs,
  };
}
