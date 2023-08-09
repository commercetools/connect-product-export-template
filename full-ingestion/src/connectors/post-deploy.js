import fetch from 'node-fetch';

import { assertError, assertString } from '../utils/assert.utils.js';

const CONNECT_SERVICE_URL = 'CONNECT_SERVICE_URL';
const COMMERCETOOLS_STORE_ID = 'COMMERCETOOLS_STORE_ID';

async function postDeploy(properties) {
  const deploymentUrl = properties.get(CONNECT_SERVICE_URL);
  const storeId = properties.get(COMMERCETOOLS_STORE_ID);

  const response = await fetch(deploymentUrl, { method: 'POST', body: params });
  const data = await response.json();
}

async function run() {
  try {
    const properties = new Map(Object.entries(process.env));
    await postDeploy(properties);
  } catch (error) {
    assertError(error);
    process.stderr.write(`Post-deploy failed: ${error.message}\n`);
    process.exitCode = 1;
  }
}

run();
