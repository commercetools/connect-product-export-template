import { logger } from '../utils/logger.utils.js';
import CustomError from '../errors/custom.error.js';

export const eventHandler = async (request, response) => {
  // Check request body
  if (!request.body) {
    logger.error('Missing request body.');
    throw new CustomError(400, 'Bad request: No Pub/Sub message was received');
  }

  // Check if the body comes in a message
  if (!request.body.message) {
    logger.error('Missing body message');
    throw new CustomError(400, 'Bad request: Wrong No Pub/Sub message format');
  }

  // TODO :
  //  1. Invoke API call to Commercetools to retrieve all products by store key/ID
  //  2. Calling SDK function within Streaming API to persist full set of products to external search engine

  // Return the response for the client
  response.status(204).send();
};
