import { Router } from 'express';

import { eventHandler } from '../controllers/event.controller.js';

const eventRouter = Router();

eventRouter.post('/:storeKey', eventHandler);

export default eventRouter;
