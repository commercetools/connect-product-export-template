import { logger } from '../utils/logger.utils.js';
import {
  default as saveProducts,
  remove as removeProduct,
} from '../extensions/algolia-example/clients/client.js';
import { getProductProjectionInStoreById } from '../clients/product-selection.query.client.js';

export async function saveChangedProductToExtSearchIndex(productId) {
  const productChunk = await getProductProjectionInStoreById(productId);
  if (!productChunk) {
    logger.info(
      `Updated product with id ${productId} doesn't belong to the current store ${process.env.CTP_STORE_KEY}. No action is needed.`
    );
  } else {
    logger.info(
      `Modified product with id ${productId} belongs to the current store ${process.env.CTP_STORE_KEY}. Sync action is going to be performed now.`
    );
    await saveProducts([productChunk]);
    logger.info(`Product ${productId} has been synced.`);
  }
}

export async function saveDeletedProductToExtSearchIndex(productId) {
  await removeProduct(productId);
  logger.info(`Product ${productId} has been removed.`);
}
