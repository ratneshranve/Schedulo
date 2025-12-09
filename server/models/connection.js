// models/connection.js
import mongoose from "mongoose";

const url = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/schedulo";

mongoose
  .connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Database connected successfully (Schedulo)"))
  .catch((err) => console.log("Database connection error:", err));
