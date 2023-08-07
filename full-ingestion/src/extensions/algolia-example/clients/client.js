import algoliasearch from 'algoliasearch';
import { config } from '../configurations/config.js';

export default function save(products) {
  const client = algoliasearch(config.applicationId, config.searchApiKey);
  const index = client.initIndex(config.index);
  index
    .saveObjects(products, { autoGenerateObjectIDIfNotExist: false })
    .catch((error) => {
      throw error;
    });
}
