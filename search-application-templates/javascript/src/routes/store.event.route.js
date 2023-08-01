import { Router } from 'express';

import { eventHandler } from '../controllers/store.event.controller.js';
const eventRouter = Router();

eventRouter.post('/', eventHandler);

export default eventRouter;
