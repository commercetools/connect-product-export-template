import { Router } from 'express';

import { eventHandler as storeEventHandler } from '../controllers/store.event.controller.js';
import { eventHandler as productSelectionEventHandler } from '../controllers/product-selection.event.controller.js';
import { eventHandler as productEventHandler } from '../controllers/product.event.controller.js';
import CustomError from '../errors/custom.error.js';
import { logger } from '../utils/logger.utils.js';

const eventRouter = Router();

async function eventHandler(request, response) {
  try {
    // Check request body
    if (!request.body) {
      logger.error('Missing request body.');
      throw new CustomError(
        400,
        'Bad request: No Pub/Sub message was received'
      );
    }

    // Check if the body comes in a message
    if (!request.body.message || !request.body.message.data) {
      logger.error('Missing message data in incoming message');
      throw new CustomError(
        400,
        'Bad request: No message data in incoming message'
      );
    }

    const encodedMessageBody = request.body.message.data;

    const buff = new Buffer(encodedMessageBody, 'base64');
    const messageBody = JSON.parse(buff.toString('ascii'));

    const resourceType = messageBody?.resource?.typeId;

    switch (resourceType) {
      case 'store':
        await storeEventHandler(request, response);
        break;
      case 'product-selection':
        await productSelectionEventHandler(request, response);
        break;
      case 'product':
        await productEventHandler(request, response);
        break;
      default:
        throw new CustomError(
          400,
          'Bad request: Resource type is not defined in incoming message data'
        );
    }
  } catch (err) {
    logger.error(err);
    return response.status(err.statusCode).send(err);
  }
}

eventRouter.post('/', eventHandler);

export default eventRouter;
