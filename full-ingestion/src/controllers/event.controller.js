import { logger } from '../utils/logger.utils.js';
import { createApiRoot } from '../clients/create.client.js';
import CustomError from '../errors/custom.error.js';
import { default as saveProducts } from '../extensions/algolia-example/clients/client.js';

async function syncProducts(storeKey) {
  const products = await getProductsByStore(storeKey);

  await saveProducts(products).catch((error) => {
    throw new CustomError(400, `Bad request: ${error.message}`, error);
  });
}

async function getProductsByStore(storeKey) {
  return await createApiRoot()
    .inStoreKeyWithStoreKeyValue({ storeKey: Buffer.from(storeKey).toString() })
    .productSelectionAssignments()
    .get({
      queryArgs: {
        expand: [
          'product',
          'product.productType',
          'product.taxCategory',
          'product.masterData.current.categories[*]',
        ],
      },
    })
    .execute()
    .then((response) => response.body.results)
    .then((results) => results.map((result) => result.product))
    .catch((error) => {
      throw new CustomError(400, `Bad request: ${error.message}`, error);
    });
}

export const eventHandler = async (request, response) => {
  // Check request body
  try {
    if (!request.body) {
      logger.error('Missing request body.');
      throw new CustomError(
        400,
        'Bad request: No Pub/Sub message was received'
      );
    }

    // Check if the body comes in a message
    if (!request.body.message) {
      logger.error('Missing body message');
      throw new CustomError(400, 'Bad request: Wrong Pub/Sub message format');
    }

    const storeKey = request.params.storeKey;
    await syncProducts(storeKey);
  } catch (err) {
    logger.error(err);
    return response.status(err.statusCode).send(err);
  }

  // Return the response for the client
  return response.status(204).send();
};
