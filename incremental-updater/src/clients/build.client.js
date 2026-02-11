import { ClientBuilder } from '@commercetools/sdk-client-v2';
import { getAuthMiddlewareOptions } from '../middlewares/auth.middleware.js';
import { getHttpMiddlewareOptions } from '../middlewares/http.middleware.js';
import { readConfiguration } from '../utils/config.utils.js';

/**
 * Create a new client builder.
 * This code creates a new client builder that can be used to make API calls
 */
export const createClient = () => {
  const config = readConfiguration();
  return new ClientBuilder()
    .withProjectKey(config.projectKey)
    .withClientCredentialsFlow(getAuthMiddlewareOptions())
    .withHttpMiddleware(getHttpMiddlewareOptions())
    .build();
};
