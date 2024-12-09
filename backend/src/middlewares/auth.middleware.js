import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const authenticateToken = asyncHandler(async (req, resp, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extract token from Bearer

  if (!token || token === "null") {
    return resp
      .status(401)
      .json(new ApiResponse(401, null, "No token provided"));
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return resp.status(401).json(new ApiResponse(401, null, "Invalid token"));
    }

    // Ensure userId is correctly decoded
    req.user = { userId: decoded.userId };
    next();
  });
});
