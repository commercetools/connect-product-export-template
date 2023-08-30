import { decodeToJson } from '../utils/decoder.utils.js';
import { logger } from '../utils/logger.utils.js';
import CustomError from '../errors/custom.error.js';
import { getProductsByProductSelectionId } from '../clients/query.client.js';

// async function syncUpdatedProductSelection(updatedProductSelections) {
//   if (updatedProductSelections) {
//     updatedProductSelections
//         .filter(productSelection => productSelection?.productSelection?.typeId==='product-selection')
//         .filter(productSelection => productSelection?.productSelection?.typeId==='product-selection')
//         .map(productSelection => {
//
//       console.log(productSelection.productSelection?.id)
//     })
//   }
// }

async function getRemovedProducts(removedProductSelection) {
  const removedProducts = (
    await Promise.all(
      removedProductSelection
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
  return removedProducts;
}

async function syncRemovedProductSelection(removedProductSelection) {
  logger.info(`Removing product selections.`);

  if (removedProductSelection) {
    await getRemovedProducts(removedProductSelection);
    // TODO : parse the removedProducts to search index for product removal
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
        // TODO : Check product selection is activated / deactivated
        //await syncUpdatedProductSelection(messageBody.updatedProductSelections)
        logger.info(
          `Checking if product selections are activated / deactivated.`
        );
      } else if (messageBody.removedProductSelections) {
        await syncRemovedProductSelection(messageBody.removedProductSelections);
      } else if (messageBody.addedProductSelections) {
        // TODO : Add products within the deleted product selections
        logger.info(`Adding product selections`);
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
