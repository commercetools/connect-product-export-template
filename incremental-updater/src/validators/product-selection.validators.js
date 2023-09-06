import CustomError from '../errors/custom.error.js';
import { HTTP_STATUS_SUCCESS_ACCEPTED } from '../constants/http.status.constants.js';
import { getCurrentStore } from '../clients/product-selection.query.client.js';

export async function doValidation(messageBody) {
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
  const productSelectionIdFromMessage = messageBody.resource.id;

  const store = await getCurrentStore(productSelectionIdFromMessage);
  if (!store) {
    throw new CustomError(
      HTTP_STATUS_SUCCESS_ACCEPTED,
      `The product selection in notification is not an active product selection of current store. No further action is required. `
    );
  }
}
