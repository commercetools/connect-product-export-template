import { decodeToJson } from '../utils/decoder.utils.js';
import CustomError from '../errors/custom.error.js';
import { createApiRoot } from '../../src/clients/create.client.js';
import { logger } from '../utils/logger.utils.js';
import {
  default as saveProducts,
  remove as removeProduct,
} from '../extensions/algolia-example/clients/client.js';

const CHUNK_SIZE = 100;

async function getProductFromCurrentStore(productId) {
  let queryArgs = {
    limit: CHUNK_SIZE,
    withTotal: false,
    sort: 'product.id asc',
    expand: [
      'product',
      'product.productType',
      'product.taxCategory',
      'product.masterData.current.categories[*]',
    ],
  };

  queryArgs.where = `product(id="${productId}")`;

  return await createApiRoot()
    .inStoreKeyWithStoreKeyValue({
      storeKey: Buffer.from(process.env.CTP_STORE_KEY).toString(),
    })
    .productSelectionAssignments()
    .get({ queryArgs })
    .execute()
    .then((response) => response.body.results)
    .then((results) => results.map((result) => result.product))
    .catch((error) => {
      throw new CustomError(400, `Bad request: ${error.message}`, error);
    });
}

async function saveChangedProductToExtSearchIndex(productId) {
  const productChunk = await getProductFromCurrentStore(productId);
  if (productChunk.length === 0) {
    logger.info(
      `Updated product with id ${productId} doesn't belong to the current store ${process.env.CTP_STORE_KEY}. No action is needed.`
    );
  } else {
    logger.info(
      `Modified product with id ${productId} belongs to the current store ${process.env.CTP_STORE_KEY}. Sync action is going to be performed now.`
    );
    await saveProducts(productChunk);
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
      default:
        throw new CustomError(
          400,
          `Bad request: Notification type ${notificationType} is not correctly defined`
        );
    }
  }

  // Return the response for the client
  response.status(204).send();
};
