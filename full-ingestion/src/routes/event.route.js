import { Router } from 'express';

import { eventHandler } from '../controllers/event.controller.js';

const eventRouter = Router();

eventRouter.post('/fullSync/:storeKey', eventHandler);

export default eventRouter;
