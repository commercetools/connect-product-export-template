import { Router } from 'express';

import { syncHandler } from '../controllers/sync.controller.js';

const syncRouter = Router();

syncRouter.post('/fullSync/:storeKey', syncHandler);

export default syncRouter;
