import { createApiRoot } from './create.client.js';
import CustomError from '../errors/custom.error.js';
import { HTTP_STATUS_SUCCESS_ACCEPTED } from '../constants/http.status.constants.js';

const CHUNK_SIZE = 100;

const productQueryArgs = {
  limit: CHUNK_SIZE,
  withTotal: false,
  sort: 'product.id asc',
  expand: [
    'productSelection',
    'product',
    'product.productType',
    'product.taxCategory',
    'product.masterData.current.categories[*]',
  ],
};

export const getProductFromCurrentStore = async (productId) => {
  let queryArgs = productQueryArgs;

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
      throw new CustomError(
        HTTP_STATUS_SUCCESS_ACCEPTED,
        `Bad request: ${error.message}`,
        error
      );
    });
};

export const getCurrentStore = async () => {
  const store = await createApiRoot()
    .stores()
    .withKey({
      key: Buffer.from(process.env.CTP_STORE_KEY).toString(),
    })
    .get()
    .execute()
    .then((response) => response.body)
    .catch((error) => {
      throw new CustomError(
        HTTP_STATUS_SUCCESS_ACCEPTED,
        `${error.message}`,
        error
      );
    });
  return store;
};

export const getCurrentStoreAssignmentsByProductSelectionId = async (
  productSelectionId
) => {
  let queryArgs = productQueryArgs;
  queryArgs.where = `productSelection(id="${productSelectionId}")`;

  return await createApiRoot()
    .inStoreKeyWithStoreKeyValue({
      storeKey: Buffer.from(process.env.CTP_STORE_KEY).toString(),
    })
    .productSelectionAssignments()

    .get({ queryArgs })
    .execute()
    .then((response) => response.body.results)
    .then((results) => {
      return results;
    })
    .catch((error) => {
      throw new CustomError(
        HTTP_STATUS_SUCCESS_ACCEPTED,
        `${error.message}`,
        error
      );
    });
};

export const getProductsByProductSelectionId = async function (
  productSelectionId
) {
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
        throw new CustomError(400, `Bad request: ${error.message}`, error);
      });
    hasNextQuery = productChunk.length === CHUNK_SIZE;
    if (productChunk.length > 0) {
      lastProductId = productChunk[productChunk.length - 1].id;
      allProducts = allProducts.concat(productChunk);
    }
  }
  return allProducts;
};
