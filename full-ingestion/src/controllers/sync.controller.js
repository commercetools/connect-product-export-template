import { logger } from '../utils/logger.utils.js';
import { createApiRoot } from '../clients/create.client.js';
import CustomError from '../errors/custom.error.js';
import { default as saveProducts } from '../extensions/algolia-example/clients/client.js';

const CHUNK_SIZE = 100;

async function syncProducts(storeKey) {
  const products = await getProductsByStore(storeKey);

  await saveProducts(products).catch((error) => {
    throw new CustomError(400, `Bad request: ${error.message}`, error);
  });
}

async function getProductsByStore(storeKey) {
  let lastProductId = undefined;
  let hasNextQuery = true;
  let allProducts = [];

  while (hasNextQuery) {
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
    if (lastProductId) {
      queryArgs.where = `product(id>"${lastProductId}")`;
    }

    let productChunk = await createApiRoot()
      .inStoreKeyWithStoreKeyValue({
        storeKey: Buffer.from(storeKey).toString(),
      })
      .productSelectionAssignments()
      .get({ queryArgs })
      .execute()
      .then((response) => response.body.results)
      .then((results) => results.map((result) => result.product))
      .catch((error) => {
        throw new CustomError(400, `Bad request: ${error.message}`, error);
      });
    hasNextQuery = productChunk.length == CHUNK_SIZE;
    if (productChunk.length > 0) {
      lastProductId = productChunk[productChunk.length - 1].id;
      allProducts = allProducts.concat(productChunk);
    }
  }
  return allProducts;
}

export const syncHandler = async (request, response) => {
  try {
    const storeKey = request.params.storeKey;
    if (!storeKey) {
      logger.error('Missing store key in query parameter.');
      throw new CustomError(
        400,
        'Bad request: No store key is defined in query parameter'
      );
    }
    await syncProducts(storeKey);
  } catch (err) {
    logger.error(err);
    return response.status(err.statusCode).send(err);
  }

  // Return the response for the client
  return response.status(204).send();
};
