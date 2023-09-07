import { createApiRoot } from './create.client.js';
import CustomError from '../errors/custom.error.js';
import { HTTP_STATUS_SUCCESS_ACCEPTED } from '../constants/http.status.constants.js';

const CHUNK_SIZE = 100;

const productQueryArgs = {
  limit: CHUNK_SIZE,
  withTotal: false,
  sort: 'product.id asc',
  expand: ['productSelection', 'taxCategory', 'productType', 'categories[*]'],
};

export async function getProductProjectionInStoreById(productId) {
  const queryArgs = productQueryArgs;
  return await createApiRoot()
    .inStoreKeyWithStoreKeyValue({
      storeKey: Buffer.from(process.env.CTP_STORE_KEY).toString(),
    })
    .productProjections()
    .withId({
      ID: Buffer.from(productId).toString(),
    })
    .get({ queryArgs })
    .execute()
    .then((response) => response.body);
}

export async function getProductsByProductSelectionId(productSelectionId) {
  let lastProductId = undefined;
  let hasNextQuery = true;
  let allProducts = [];

  while (hasNextQuery) {
    let queryArgs = productQueryArgs;
    if (lastProductId) {
      queryArgs.where = `product(id>"${lastProductId}")`;
    }
    const productChunk = await createApiRoot()
      .productSelections()
      .withId({ ID: Buffer.from(productSelectionId).toString() })
      .products()
      .get({ queryArgs })
      .execute()
      .then((response) => response.body.results)
      .then((results) => results.map((result) => result.product))
      .catch((error) => {
        throw new CustomError(
          HTTP_STATUS_SUCCESS_ACCEPTED,
          error.message,
          error
        );
      });
    hasNextQuery = productChunk.length === CHUNK_SIZE;
    if (productChunk.length > 0) {
      lastProductId = productChunk[productChunk.length - 1].id;
      allProducts = allProducts.concat(productChunk);
    }
  }
  return allProducts;
}
