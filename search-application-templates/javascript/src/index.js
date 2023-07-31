import "dotenv/config";

import express from "express";
import bodyParser from "body-parser";

// Import routes
import StoreEventRoutes from "./routes/store.event.route.js";
import ProductSelectionEventRoutes from "./routes/product-selection.event.route.js";
import ProductEventRoutes from "./routes/product.event.route.js";
import { logger } from "./utils/logger.utils.js";

const PORT = 8080;

// Create the express app
const app = express();

// Define configurations
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Define routes
app.use("/store", StoreEventRoutes);
app.use("/productSelection", ProductSelectionEventRoutes);
app.use("/product", ProductEventRoutes);

// Listen the application
const server = app.listen(PORT, () => {
  logger.info(`⚡️ Event application listening on port ${PORT}`);
});

export default server;
