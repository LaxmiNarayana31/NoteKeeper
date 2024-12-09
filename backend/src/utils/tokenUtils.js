import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user._id }, // Ensure userId is included
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1d" }
  );
};
