import CustomError from '../errors/custom.error.js';
import { HTTP_STATUS_SUCCESS_ACCEPTED } from '../constants/http.status.constants.js';

export async function doValidation(messageBody) {
  if (!messageBody) {
    throw new CustomError(
      HTTP_STATUS_SUCCESS_ACCEPTED,
      `The incoming message body is missing. No further action is required. `
    );
  }
  const notificationType = messageBody.notificationType;
  if (
    notificationType !== 'ResourceUpdated' &&
    notificationType !== 'ResourceCreated' &&
    notificationType !== 'ResourceDeleted'
  ) {
    throw new CustomError(
      HTTP_STATUS_SUCCESS_ACCEPTED,
      ` Notification type ${notificationType} is not correctly defined`
    );
  }

  const productId = messageBody?.resource?.id;
  if (!productId) {
    throw new CustomError(
      HTTP_STATUS_SUCCESS_ACCEPTED,
      ` No product ID is found in message`
    );
  }
}
