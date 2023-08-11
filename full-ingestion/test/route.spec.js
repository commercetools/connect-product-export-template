import { expect, describe, beforeAll, afterAll, it } from '@jest/globals';
import request from 'supertest';
import server from '../src/index.js';

describe('Test event.controller.js', () => {
  const storeKey = 'MY_STORE_KEY'; // Specify the key of Commercetools Store for product synchronization

  it(`POST /${storeKey}`, async () => {
    let response = {};
    // Send request to the connector application with following code statement
    /**
            response = await request(server).post(`/${storeKey}`);
         **/
    expect(response).toBeDefined();
  });

  it(`POST /`, async () => {
    const res = await request(server).post(`/`);
    expect(res.statusCode).toBe(404);
  });

  afterAll(() => {
    if (server) {
      server.close();
    }
  });
});
