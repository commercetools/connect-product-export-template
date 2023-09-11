import { Router } from 'express';

import { eventHandler as storeEventHandler } from '../controllers/store.event.controller.js';
import { eventHandler as productSelectionEventHandler } from '../controllers/product-selection.event.controller.js';
import { eventHandler as productEventHandler } from '../controllers/product.event.controller.js';
import CustomError from '../errors/custom.error.js';
import { logger } from '../utils/logger.utils.js';
import { decodeToJson } from '../utils/decoder.utils.js';
import {
  HTTP_STATUS_SUCCESS_ACCEPTED,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_SUCCESS_NO_CONTENT,
} from '../constants/http.status.constants.js';

const eventRouter = Router();

async function eventHandler(request, response) {
  try {
    // Check request body
    if (!request.body) {
      logger.error('Missing request body.');
      throw new CustomError(
        HTTP_STATUS_BAD_REQUEST,
        'Bad request: No Pub/Sub message was received'
      );
    }

    // Check if the body comes in a message
    if (!request.body.message || !request.body.message.data) {
      logger.error('Missing message data in incoming message');
      throw new CustomError(
        HTTP_STATUS_BAD_REQUEST,
        'Bad request: No message data in incoming message'
      );
    }

    const encodedMessageBody = request.body.message.data;
    const messageBody = decodeToJson(encodedMessageBody);
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
      case 'subscription': // Handle the ack once subscription is created after deployment
        response.status(HTTP_STATUS_SUCCESS_NO_CONTENT).send();
        break;
      default:
        throw new CustomError(
          HTTP_STATUS_SUCCESS_ACCEPTED,
          'Resource type is not defined in incoming message data'
        );
    }
  } catch (err) {
    logger.error(err);
    return response.status(err.statusCode).send();
  }
}

eventRouter.post('/deltaSync', eventHandler);

export default eventRouter;
