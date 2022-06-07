/**
 * Provides all interfaces for each module configuration
 * @author Starter project, edited by Alex Carney
 */
export interface Config {
  nest: NestConfig;
  cors: CorsConfig;
  legacy_swagger: SwaggerConfig;
  v2_swagger: SwaggerConfig;
  security: SecurityConfig;
  throttler: ThrottlerConfig;
  api_config: ApiConfig;
}

export interface NestConfig {
  port: number;
}

export interface CorsConfig {
  enabled: boolean;
}

export interface SwaggerConfig {
  enabled: boolean;
  title: string;
  description: string;
  version: string;
  path: string;
}

export interface SecurityConfig {
  expiresIn: string;
  refreshIn: string;
  bcryptSaltOrRound: string | number;
}

export interface ThrottlerConfig {
  throttleTTL: number;
  throttleLimit: number;
}

export interface ApiConfig {
  supportedDelimiters: Array<string>;
  allowedFileTypes: Array<string>;
}
