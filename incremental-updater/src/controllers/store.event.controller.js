import { decodeToJson } from '../utils/decoder.utils.js';
import { logger } from '../utils/logger.utils.js';
import CustomError from '../errors/custom.error.js';
import { getProductsByProductSelectionId } from '../clients/query.client.js';
import {
  default as saveProducts,
  remove as removeProduct,
} from '../extensions/algolia-example/clients/client.js';


async function syncUpdatedProductSelection(updatedProductSelections) {
  logger.info(`Checking if product selections are activated / deactivated.`);
  if (updatedProductSelections) {
    const activatedProductSelections  = updatedProductSelections.filter((productSelection) =>
        productSelection.active === true)
    const deactivatedProductSelection  = updatedProductSelections.filter((productSelection) =>
        productSelection.active === false)

    if (activatedProductSelections) {
      const addedProducts = await getProductsByProductSelection(activatedProductSelections);
      await saveProducts(addedProducts);
    }
    if (deactivatedProductSelection) {
      const removedProducts = await getProductsByProductSelection(deactivatedProductSelection);
      for (let productToBeRemoved of removedProducts) {
        await removeProduct(productToBeRemoved.id);
      }
    }
  }
}

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

async function syncAddedProductSelection(addedProductSelection) {
  logger.info(`Adding product selections.`);

  const activatedProductSelections  = addedProductSelection.filter((productSelection) =>
      productSelection.active === true)

  if (activatedProductSelections.length>0) {
    const addedProducts = await getProductsByProductSelection(addedProductSelection);
    await saveProducts(addedProducts);
  } else {
    logger.info(`The changed product selections are not activated. No sync action is required.`);
  }
}

async function syncRemovedProductSelection(removedProductSelection) {
  logger.info(`Removing product selections.`);

  if (removedProductSelection) {
    const removedProducts = await getProductsByProductSelection(removedProductSelection);
    for (let productToBeRemoved of removedProducts) {
      await removeProduct(productToBeRemoved.id);
    }
  }
}

export const eventHandler = async (request, response) => {
  // Receive the Pub/Sub message
  const encodedMessageBody = request.body.message.data;
  const messageBody = decodeToJson(encodedMessageBody);

  if (messageBody) {
    const type = messageBody.type;
    const storeId = messageBody.resource.id;
    if (type === 'StoreProductSelectionsChanged') {
      logger.info(
        `Product selection within store ${storeId} has been changed.`
      );
      if (messageBody.updatedProductSelections) {
        await syncUpdatedProductSelection(messageBody.updatedProductSelections);
      } else if (messageBody.removedProductSelections) {
        await syncRemovedProductSelection(messageBody.removedProductSelections);
      } else if (messageBody.addedProductSelections) {
        await syncAddedProductSelection(messageBody.addedProductSelections);
      } else {
        throw new CustomError(
          500,
          `Server error: Unable to find suitable actions (addedProductSelections/removedProductSelections/updatedProductSelections) within StoreProductSelectionsChanged message.`
        );
      }
    }
  }

  // Return the response for the client
  response.status(204).send();
};
