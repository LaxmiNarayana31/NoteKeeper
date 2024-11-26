import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authenticateToken = asyncHandler(async (req, resp, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extract token from Bearer

  if (!token || token === "null") {
    throw new ApiError(401, "No token provided");
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) throw new ApiError(401, "Invalid token");

    // Ensure userId is correctly decoded
    req.user = { userId: decoded.userId };
    next();
  });
});
