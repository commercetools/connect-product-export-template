import { decodeToJson } from '../utils/decoder.utils.js';
import { logger } from '../utils/logger.utils.js';

import {
  getProductsByProductSelectionId,
  getProductProjectionInStoreById,
} from '../clients/store.query.client.js';
import {
  default as saveProducts,
  removeProducts,
} from '../extensions/algolia-example/clients/client.js';
import { HTTP_STATUS_SUCCESS_NO_CONTENT } from '../constants/http.status.constants.js';

import { doValidation } from '../validators/store.validators.js';
import CustomError from '../errors/custom.error.js';
import {
  HTTP_STATUS_SUCCESS_ACCEPTED,
  HTTP_STATUS_RESOURCE_NOT_FOUND,
} from '../constants/http.status.constants.js';

async function syncChangedProductSelections(messageBody) {
  let changedProductSelections = undefined;
  if (messageBody.removedProductSelections)
    changedProductSelections = messageBody.removedProductSelections;
  else if (messageBody.addedProductSelections)
    changedProductSelections = messageBody.addedProductSelections;
  else if (messageBody.updatedProductSelections)
    changedProductSelections = messageBody.updatedProductSelections;

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

  logger.info(
    `The changed product selection contains ${productsInChangedProductSelection.length} product(s).`
  );
  let productsToBeSynced = [];
  let productIdsToBeRemoved = [];
  for (let productInChangedProductSelection of productsInChangedProductSelection) {
    let productToBeSynced = undefined;
    productToBeSynced = await getProductProjectionInStoreById(
      productInChangedProductSelection.id
    ).catch(async (error) => {
      // Product cannot be found in store assignment. Need to remove product in external search index
      if (error.statusCode === HTTP_STATUS_RESOURCE_NOT_FOUND) {
        logger.info(
          `Product "${productInChangedProductSelection.id}" is not found in the current store. The changed product is going to be removed in search index.`
        );
        productIdsToBeRemoved = productIdsToBeRemoved.concat(
          productInChangedProductSelection.id
        );
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
  if (productIdsToBeRemoved.length > 0) {
    logger.info(
      `${productIdsToBeRemoved.length} product(s) to be removed from search index.`
    );
    await removeProducts(productIdsToBeRemoved);
    logger.info(`Product(s) has been removed from search index.`);
  }
  if (productsToBeSynced.length > 0) {
    logger.info(
      `${productsToBeSynced.length} product(s) to be synced to search index.`
    );
    await saveProducts(productsToBeSynced);
    logger.info(`Product(s) has been added/updated to to search index.`);
  }
}

export const eventHandler = async (request, response) => {
  // Receive the Pub/Sub message
  const encodedMessageBody = request.body.message.data;
  const messageBody = decodeToJson(encodedMessageBody);

  doValidation(messageBody);

  await syncChangedProductSelections(messageBody);

  // Return the response for the client
  response.status(HTTP_STATUS_SUCCESS_NO_CONTENT).send();
};
