import { decodeToJson } from '../utils/decoder.utils.js';
import {
  getCurrentStore,
} from '../clients/query.client.js';
import CustomError from '../errors/custom.error.js';
import {
  HTTP_STATUS_SUCCESS_ACCEPTED,
  HTTP_STATUS_SUCCESS_NO_CONTENT,
} from '../constants/http.status.constants.js';
import { saveChangedProductToExtSearchIndex, saveDeletedProductToExtSearchIndex } from './common.controller.js';

async function doValidation(messageBody) {
  const type = messageBody.type;

  if (!messageBody) {
    throw new CustomError(
      HTTP_STATUS_SUCCESS_ACCEPTED,
      `The incoming message body is missing. No further action is required. `
    );
  }

  if (
    type !== 'ProductSelectionProductRemoved' &&
    type !== 'ProductSelectionProductAdded' &&
    type !== 'ProductSelectionVariantSelectionChanged'
  ) {
    throw new CustomError(
      HTTP_STATUS_SUCCESS_ACCEPTED,
      `The incoming message belongs to an incorrect type ${type}. No further action is required. `
    );
  }
  const store = await getCurrentStore();
  const productSelectionIdFromMessage = messageBody.resource.id;

  // Make sure product selection from message is active and has been assigned to current store.
  const productSelectionSettings = store.productSelections
    .filter(
      (productSelectionSetting) =>
        productSelectionSetting.productSelection.id ===
        productSelectionIdFromMessage
    )
    .filter((productSelectionSetting) => productSelectionSetting.active);

  if (productSelectionSettings.length === 0) {
    throw new CustomError(
      HTTP_STATUS_SUCCESS_ACCEPTED,
      `The product selection in notification is not an active product selection of current store. No further action is required. `
    );
  }
}

export const eventHandler = async (request, response) => {
  // Receive the Pub/Sub message
  const encodedMessageBody = request.body.message.data;
  const messageBody = decodeToJson(encodedMessageBody);

  await doValidation(messageBody);
  console.log(messageBody);

  const type = messageBody.type;
  const typeId = messageBody?.product?.typeId;
  const productId = messageBody?.product?.id;
  switch (type) {
    case 'ProductSelectionVariantSelectionChanged':
      await saveChangedProductToExtSearchIndex(productId);
      break;
    case 'ProductSelectionProductRemoved':
      await saveDeletedProductToExtSearchIndex(productId);
      break;
    case 'ProductSelectionProductAdded':
      await saveChangedProductToExtSearchIndex(productId);
      break;
    default:
      throw new CustomError(
        HTTP_STATUS_SUCCESS_ACCEPTED,
        `Unable to find suitable actions [ProductSelectionVariantSelectionChanged,ProductSelectionProductRemoved,ProductSelectionProductAdded] within StoreProductSelectionsChanged message.`
      );
  }

  // Return the response for the client
  response.status(HTTP_STATUS_SUCCESS_NO_CONTENT).send();
};
