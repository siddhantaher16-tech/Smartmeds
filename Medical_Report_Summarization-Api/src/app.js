import "dotenv/config";
import "express-async-errors";
import express from "express";
import cors from "cors";

import errorHandler from "./middleware/errorHandler.js";
import routes from "./routes/index.js";

const app = express();

app.use(cors()); // Allow all origins for now
app.use(express.json());

// Mount central router
app.use("/api", routes);

// Use the errorHandler middleware at the bottom
app.use(errorHandler);

export default app;
