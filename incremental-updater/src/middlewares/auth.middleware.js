import { readConfiguration } from '../utils/config.utils.js';

/**
 * Configure Middleware. Example only. Adapt on your own
 */
export const getAuthMiddlewareOptions = () => {
  const config = readConfiguration();
  return {
    host: `https://auth.${config.region}.commercetools.com`,
    projectKey: config.projectKey,
    credentials: {
      clientId: config.clientId,
      clientSecret: config.clientSecret,
    },
    scopes: [config.scope ? config.scope : 'default'],
  };
};
