import { logger } from '../utils/logger.utils.js';
import { createApiRoot } from '../clients/create.client.js';
import CustomError from '../errors/custom.error.js';
import { Process as process } from '@commercetools/sdk-client-v2';
import { default as productMapping } from '../extensions/algolia-example/mappers/product.mapper.js';
import { default as saveProducts } from '../extensions/algolia-example/clients/client.js';

// async function getProductsByProductSelection(productSelectionId)  {
//
//   return await createApiRoot()
//     .productSelections()
//     .withId({ ID: Buffer.from(productSelectionId).toString() })
//     .products()
//     .get({
//       queryArgs : {
//         expand : 'product'
//       }
//     })
//     .execute()
//     .then(response => response.body.results)
//
// }

async function syncProcess(data) {
  const results = data.body.results;
  if (results) {
    const mappedProducts = results.map((product) => productMapping(product));
    saveProducts(mappedProducts);
  }
}

async function syncProducts(storeId) {
  const productSelections = await getProductSelectionsByStoreId(storeId)

  productSelections.map(async (productionSelecton) =>  {
    const productSelectionId = productionSelecton.productSelection.id
    const request = await createApiRoot()
        .productSelections()
        .withId({ ID: Buffer.from(productSelectionId).toString() })
        .products()
        .get({ queryArgs: { sort: 'sort' } }).request

    await process(request, syncProcess, {
      accumulate: false
    });
  })
}

async function getProductSelectionsByStoreId(storeId)  {
  return await createApiRoot()
    .stores()
    .withId({ ID: Buffer.from(storeId).toString() })
    .get({
      queryArgs : {
        expand : 'productSelections[*].productSelection'
      }
    })
    .execute()
    .then(response =>
      response.body.productSelections
   )
    .catch(error => {
      throw new CustomError(400, `Bad request: ${error}`);
    });

}

export const eventHandler = async (request, response) => {
  // Check request body
  if (!request.body) {
    logger.error('Missing request body.');
    throw new CustomError(400, 'Bad request: No Pub/Sub message was received');
  }

  // Check if the body comes in a message
  if (!request.body.message) {
    logger.error('Missing body message');
    throw new CustomError(400, 'Bad request: Wrong Pub/Sub message format');
  }

  const storeId = request.params.id

  await syncProducts(storeId);

  // Return the response for the client
  response.status(204).send();
};
