import { Config } from './config.interface';

const config: Config = {
  nest: {
    port: 3000,
  },
  cors: {
    enabled: true,
  },
  legacy_swagger: {
    enabled: true,
    title: `Skidmore Catalog V1`,
    description: 'The legacy (deprecated) API for data from the Skidmore College physics research group. Click <a href="/">here</a> to go back to the homepage. Click <a href="/documentation">here</a> for instructions/documentation. Click <a href="/api">here</a> to access the new version of the API',
    version: '1.0',
    path: 'legacy-api',
  },
  v2_swagger: {
    enabled: true,
    title: `Skidmore Catalog V2`,
    description: `API for data from the Skidmore College Physics Department. Click <a href="/">here</a> to go back to the homepage. Click <a href="/documentation">here</a> for instructions/documentation. Click <a href="/legacy-api">here</a> to access the old version of the API'`,
    version: '1.0',
    path: 'api',
  },
  security: {
    expiresIn: '2m',
    refreshIn: '7d',
    bcryptSaltOrRound: 10,
  },
  throttler: {
    throttleTTL: 30,
    throttleLimit: 150,
  },
  api_config: {
    supportedDelimiters: [",", "  ", "%09", "%20", "\t"],
    bannedFileTypes: ["text/csv"]
  },
};

export default (): Config => config;
