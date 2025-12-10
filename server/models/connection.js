// models/connection.js
import mongoose from "mongoose";

const url = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/schedulo";

mongoose
  .connect(url)       // <- No extra options needed in Mongoose 7+
  .then(() => console.log("Database connected successfully (Schedulo)"))
  .catch((err) => console.log("Database connection error:", err));
