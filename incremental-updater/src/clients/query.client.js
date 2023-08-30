import { createApiRoot } from './create.client.js';
import CustomError from '../errors/custom.error.js';

const CHUNK_SIZE = 100;

export const getProductsByProductSelectionId = async function (
  productSelectionId
) {
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
