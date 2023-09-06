import { decodeToJson } from '../utils/decoder.utils.js';
import { logger } from '../utils/logger.utils.js';

import { HTTP_STATUS_SUCCESS_NO_CONTENT } from '../constants/http.status.constants.js';

import { doValidation } from '../validators/product.validators.js';
import { getProductProjectionInStoreById } from '../clients/product.query.client.js';
import {
  default as saveProducts,
  remove as removeProduct,
} from '../extensions/algolia-example/clients/client.js';

async function saveChangedProductToExtSearchIndex(productId) {
  const productChunk = await getProductProjectionInStoreById(productId);
  if (!productChunk) {
    logger.info(
      `Updated product with id ${productId} doesn't belong to the current store ${process.env.CTP_STORE_KEY}. Delete action is going to be performed.`
    );
    await saveDeletedProductToExtSearchIndex(productId);
  } else {
    logger.info(
      `Modified product with id ${productId} belongs to the current store ${process.env.CTP_STORE_KEY}. Sync action is going to be performed.`
    );
    await saveProducts([productChunk]);
    logger.info(`Product ${productId} has been synced.`);
  }
}

async function saveDeletedProductToExtSearchIndex(productId) {
  await removeProduct(productId);
  logger.info(`Product ${productId} has been removed.`);
}

export const eventHandler = async (request, response) => {
  // Receive the Pub/Sub message
  const encodedMessageBody = request.body.message.data;
  const messageBody = decodeToJson(encodedMessageBody);

  if (messageBody) {
    const notificationType = messageBody.notificationType;
    const productId = messageBody.resource.id;

    await doValidation(messageBody);
    logger.info(
      `sync product ${productId} with notification type ${notificationType}`
    );
    switch (notificationType) {
      case 'ResourceUpdated':
        await saveChangedProductToExtSearchIndex(productId);
        break;
      case 'ResourceCreated':
        await saveChangedProductToExtSearchIndex(productId);
        break;
      case 'ResourceDeleted':
        await saveDeletedProductToExtSearchIndex(productId);
        break;
    }
  }

  // Return the response for the client
  response.status(HTTP_STATUS_SUCCESS_NO_CONTENT).send();
};
