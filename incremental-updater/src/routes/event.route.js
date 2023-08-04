import { Router } from 'express';

import { eventHandler as storeEventHandler } from '../controllers/store.event.controller.js';
import { eventHandler as productSelectionEventHandler } from '../controllers/product-selection.event.controller.js';
import { eventHandler as productEventHandler } from '../controllers/product.event.controller.js';
import CustomError from '../errors/custom.error.js';
import { logger } from '../utils/logger.utils.js';

const eventRouter = Router();

async function eventHandler(request, response) {
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

  // TODO : Investigate how to determine the source subscription of the message (store? product-selection? product?)
  const message = request.body.message;
  switch (message?.source) {
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
        'Bad request: Message queue name is not defined'
      );
  }
}

eventRouter.post('/', eventHandler);

export default eventRouter;
