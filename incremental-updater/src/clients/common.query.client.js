import { createApiRoot } from './create.client.js';
import CustomError from '../errors/custom.error.js';
import { HTTP_STATUS_SUCCESS_ACCEPTED } from '../constants/http.status.constants.js';

export const CHUNK_SIZE = 100;
export const productQueryArgs = {
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
    .then((response) => response.body)
    .catch((error) => {
      throw new CustomError(
        HTTP_STATUS_SUCCESS_ACCEPTED,
        `${error.message}`,
        error
      );
    });
}
