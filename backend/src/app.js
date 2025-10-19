import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes/index.js";
//import errorHandler from "./middlewares/errorHandles.js";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use("/api", routes);
//app.use(errorHandler);

export default app;
