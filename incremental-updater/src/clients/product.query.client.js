import { createApiRoot } from './create.client.js';
import CustomError from '../errors/custom.error.js';
import { HTTP_STATUS_SUCCESS_ACCEPTED } from '../constants/http.status.constants.js';
import { productQueryArgs } from './common.query.client.js';

export async function getCurrentStoreAssignmentsByProductId(productId) {
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
}
