import express from "express";

import { middleware } from "#middlewares/middlewares.js";

// import { middleware } from "./middlewares/middlewares.js";

// ako u package.json dodamo:

// "imports": {
//     "#*": "./src/*"
// }

const app = express();
const port = process.env.PORT ?? "9001";

app.get("/", middleware);

app.listen(port, () => {
  console.log(`Express app listening on port ${port}`);
});
