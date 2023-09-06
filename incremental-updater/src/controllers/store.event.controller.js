import { decodeToJson } from '../utils/decoder.utils.js';
import { logger } from '../utils/logger.utils.js';
import CustomError from '../errors/custom.error.js';
import { getProductsByProductSelectionId } from '../clients/store.query.client.js';
import {
  default as saveProducts,
  remove as removeProduct,
} from '../extensions/algolia-example/clients/client.js';
import {
  HTTP_STATUS_SUCCESS_ACCEPTED,
  HTTP_STATUS_SUCCESS_NO_CONTENT,
} from '../constants/http.status.constants.js';

async function getProductsByProductSelection(changedProductSelection) {
  const changedProducts = (
    await Promise.all(
      changedProductSelection
        .filter(
          (productSelection) =>
            productSelection?.productSelection?.typeId === 'product-selection'
        )
        .map((productSelection) => productSelection.productSelection?.id)
        .map(async (productSelectionId) => {
          return await getProductsByProductSelectionId(productSelectionId);
        })
    )
  ).flat();
  return changedProducts;
}

async function syncUpdatedProductSelection(updatedProductSelections) {
  logger.info(`Checking if product selections are activated / deactivated.`);
  if (updatedProductSelections) {
    const activatedProductSelections = updatedProductSelections.filter(
      (productSelection) => productSelection.active === true
    );
    const deactivatedProductSelection = updatedProductSelections.filter(
      (productSelection) => productSelection.active === false
    );

    if (activatedProductSelections) {
      const addedProducts = await getProductsByProductSelection(
        activatedProductSelections
      );
      await saveProducts(addedProducts);
    }
    if (deactivatedProductSelection) {
      const removedProducts = await getProductsByProductSelection(
        deactivatedProductSelection
      );
      for (let productToBeRemoved of removedProducts) {
        await removeProduct(productToBeRemoved.id);
      }
    }
  }
}

async function syncAddedProductSelection(addedProductSelection) {
  logger.info(`Adding product selections.`);

  const activatedProductSelections = addedProductSelection.filter(
    (productSelection) => productSelection.active === true
  );

  if (activatedProductSelections.length > 0) {
    const addedProducts = await getProductsByProductSelection(
      addedProductSelection
    );
    await saveProducts(addedProducts);
  } else {
    logger.info(
      `The changed product selections are not activated. No sync action is required.`
    );
  }
}

async function syncRemovedProductSelection(removedProductSelection) {
  logger.info(`Removing product selections.`);

  if (removedProductSelection) {
    const removedProducts = await getProductsByProductSelection(
      removedProductSelection
    );
    for (let productToBeRemoved of removedProducts) {
      await removeProduct(productToBeRemoved.id);
    }
  }
}

function doValidation(messageBody) {
  const storeKey = messageBody.resourceUserProvidedIdentifiers?.key;
  const type = messageBody.type;
  if (!messageBody) {
    throw new CustomError(
      HTTP_STATUS_SUCCESS_ACCEPTED,
      `The incoming message body is missing. No further action is required. `
    );
  }
  if (storeKey !== process.env.CTP_STORE_KEY) {
    throw new CustomError(
      HTTP_STATUS_SUCCESS_ACCEPTED,
      `The incoming message is about the change in store ${storeKey}. No further action is required. `
    );
  }
  if (type !== 'StoreProductSelectionsChanged') {
    throw new CustomError(
      HTTP_STATUS_SUCCESS_ACCEPTED,
      `The incoming message belongs to type ${type}. No further action is required. `
    );
  }
}

export const eventHandler = async (request, response) => {
  // Receive the Pub/Sub message
  const encodedMessageBody = request.body.message.data;
  const messageBody = decodeToJson(encodedMessageBody);

  doValidation(messageBody);

  if (messageBody.updatedProductSelections) {
    await syncUpdatedProductSelection(messageBody.updatedProductSelections);
  } else if (messageBody.removedProductSelections) {
    await syncRemovedProductSelection(messageBody.removedProductSelections);
  } else if (messageBody.addedProductSelections) {
    await syncAddedProductSelection(messageBody.addedProductSelections);
  } else {
    throw new CustomError(
      HTTP_STATUS_SUCCESS_ACCEPTED,
      `Unable to find suitable actions (addedProductSelections/removedProductSelections/updatedProductSelections) within StoreProductSelectionsChanged message.`
    );
  }

  // Return the response for the client
  response.status(HTTP_STATUS_SUCCESS_NO_CONTENT).send();
};
