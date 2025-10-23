import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes/index.js";
import path from "path";
import { fileURLToPath } from "url";
//import errorHandler from "./middlewares/errorHandles.js";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use("/api", routes);

// Resolve directory paths (needed for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Go up TWO levels: src → backend → project
const frontendPath = path.resolve(__dirname, "../../frontend");

// Serve static files (index.html, css, js, etc.)
app.use(express.static(frontendPath));


//app.use(errorHandler);

export default app;
