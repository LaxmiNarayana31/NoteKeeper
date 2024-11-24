import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.use(express.json({ limit: "200kb" }));
app.use(express.urlencoded({ extended: true, limit: "200kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Test route to verify the server is working
app.get("/", (req, resp) => {
  resp.json({ message: "Server is up and running!" });
});

// routes import
import userRouter from "./routes/user.routes.js";

app.use("/api/v1/user", userRouter);

export { app };
