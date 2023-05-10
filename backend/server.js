import express from "express";
import cors from "cors";
import restaurants from "./api/restaurants.route.js";

const app = express();

app.use(cors());
// Server can accept json in request body
app.use(express.json());

app.use("/api/v1/restaurants", restaurants);
// If you go into a route that is not in the file
app.use("*", (req, res) => res.status(404).json({ error: "not found" }));

// So we can import in a file that accesses the database
export default app;
