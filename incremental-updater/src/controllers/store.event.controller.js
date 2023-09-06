import { decodeToJson } from '../utils/decoder.utils.js';
import { logger } from '../utils/logger.utils.js';

import {
  getProductsByProductSelectionId,
  getProductProjectionInStoreById,
} from '../clients/store.query.client.js';
import {
  default as saveProducts,
  remove as removeProduct,
} from '../extensions/algolia-example/clients/client.js';
import { HTTP_STATUS_SUCCESS_NO_CONTENT } from '../constants/http.status.constants.js';

import { doValidation } from '../validators/store.validators.js';
import CustomError from '../errors/custom.error.js';
import {
  HTTP_STATUS_SUCCESS_ACCEPTED,
  HTTP_STATUS_RESOURCE_NOT_FOUND,
} from '../constants/http.status.constants.js';

async function syncChangedProductSelections(changedProductSelections) {
  const changedProductSelectionIds = changedProductSelections.map(
    (removedProductSelection) => removedProductSelection.productSelection.id
  );
  logger.info(`Changed product selections [${changedProductSelectionIds}].`);

  const productsInChangedProductSelection = (
    await Promise.all(
      changedProductSelections.map(
        async (changedProductSelection) =>
          await getProductsByProductSelectionId(
            changedProductSelection?.productSelection.id
          )
      )
    )
  ).flat();
  console.log('##################');
  console.log(
    `productsInChangedProductSelection contains ${productsInChangedProductSelection.length} product(s)`
  );
  let productsToBeSynced = [];
  for (let productInChangedProductSelection of productsInChangedProductSelection) {
    console.log(
      `productInChangedProductSelection.id : ${productInChangedProductSelection.id}`
    );
    let productToBeSynced = undefined;
    productToBeSynced = await getProductProjectionInStoreById(
      productInChangedProductSelection.id
    ).catch(async (error) => {
      // Product cannot be found in store assignment. Need to remove product in external search index
      if (error.statusCode === HTTP_STATUS_RESOURCE_NOT_FOUND) {
        console.log(
          `Product not found in store: ${productInChangedProductSelection.id}`
        );
        await removeProduct(productInChangedProductSelection.id);
      } else {
        throw new CustomError(
          HTTP_STATUS_SUCCESS_ACCEPTED,
          error.message,
          error
        );
      }
    });

    if (productToBeSynced)
      productsToBeSynced = productsToBeSynced.concat(productToBeSynced);
  }
  if (productsToBeSynced.length > 0) {
    logger.info(
      `${productsToBeSynced.length} product(s) to be synced to search index.`
    );
    await saveProducts(productsToBeSynced);
  }
}

export const eventHandler = async (request, response) => {
  // Receive the Pub/Sub message
  const encodedMessageBody = request.body.message.data;
  const messageBody = decodeToJson(encodedMessageBody);

  doValidation(messageBody);

  const type = messageBody.type;
  let changedProductSelections = undefined;
  if (messageBody.removedProductSelections)
    changedProductSelections = messageBody.removedProductSelections;
  else if (messageBody.addedProductSelections)
    changedProductSelections = messageBody.addedProductSelections;
  else if (messageBody.updatedProductSelections)
    changedProductSelections = messageBody.updatedProductSelections;

  switch (type) {
    case 'StoreProductSelectionsChanged':
      await syncChangedProductSelections(changedProductSelections);
      break;
    case 'test':
      break;
    default:
      break;
  }

  // Return the response for the client
  response.status(HTTP_STATUS_SUCCESS_NO_CONTENT).send();
};
