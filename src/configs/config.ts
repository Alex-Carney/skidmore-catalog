import { Config } from './config.interface';

const config: Config = {
  nest: {
    port: 3000,
  },
  cors: {
    enabled: true,
  },
  swagger: {
    enabled: true,
    title: `Skidmore Catalog`,
    description: 'An API for data from the Skidmore College physics research group. Click <a href="/">here</a> to go back to the homepage',
    version: '1.0',
    path: 'api',
  },
  security: {
    expiresIn: '2m',
    refreshIn: '7d',
    bcryptSaltOrRound: 10,
  },
  throttler: {
    throttleTTL: 60,
    throttleLimit: 10,
  },
};

export default (): Config => config;
