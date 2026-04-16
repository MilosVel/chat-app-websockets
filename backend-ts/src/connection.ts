import mongoose from "mongoose";
import "dotenv/config";

const mongoUrl = process.env.MONGO_DB_URL;
if (!mongoUrl) throw new Error("MONGO_DB_URL is not defined");

/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
mongoose
    .connect(mongoUrl)
    .then(() => {
        console.log("Connected to mongodb");
    })
    .catch((err: unknown) => {
        console.error("Error connecting to mongodb: ", err);
    });
/* eslint-enable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */