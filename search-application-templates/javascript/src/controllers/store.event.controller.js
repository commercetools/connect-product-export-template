import CustomError from '../errors/custom.error.js';
import { logger } from '../utils/logger.utils.js';

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

  // Receive the Pub/Sub message
  const pubSubMessage = request.body.message;

  const decodedData = pubSubMessage.data
    ? Buffer.from(pubSubMessage.data, 'base64').toString().trim()
    : undefined;

  if (decodedData) {
    // TODO : Synchronize change in commercetools platform to search engine.
    //     const jsonData = JSON.parse(decodedData);
  }

  // Return the response for the client
  response.status(204).send();
};
