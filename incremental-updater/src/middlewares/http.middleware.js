import { readConfiguration } from '../utils/config.utils.js';

/**
 * Configure Middleware. Example only. Adapt on your own
 */
export const getHttpMiddlewareOptions = () => {
  const config = readConfiguration();
  return {
    host: `https://api.${config.region}.commercetools.com`,
  };
};
