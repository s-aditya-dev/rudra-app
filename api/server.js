import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
import clientRoute from "./routes/client.route.js";
import clientVisitRoute from "./routes/clientVisit.route.js";
import visitsRoute from "./routes/visits.route.js";

const port = 8000;

const app = express();
dotenv.config();
mongoose.set("strictQuery", true);

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Connected to MongoDB.");
  } catch (error) {
    console.log(error);
  }
};

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

//routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/clients", clientRoute);
app.use(
  "/api/clients/:id/clientVisits",
  (req, res, next) => {
    req.clientID = req.params.id;
    next();
  },
  clientVisitRoute
);
app.use("/api/clientVisits", visitsRoute);

app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went Wrong!";

  return res.status(errorStatus).send(errorMessage);
});

app.listen(port, () => {
  connect();
  console.log("Backend server is running...");
});
