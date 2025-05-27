import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { AuthenticatedSocket } from "../index"; // Import the extended type

/**
 * Socket.IO middleware to authenticate clients using a JWT token.
 * Attaches user information to the socket if authentication is successful.
 */
export const socketAuthMiddleware = (
  socket: AuthenticatedSocket, // Use the extended type
  next: (err?: any) => void // Standard middleware next function
) => {
  // Client should send the JWT in the 'token' field of the 'auth' handshake property
  const token = socket.handshake.auth.token;

  if (!token) {
    // No token provided, reject the connection
    return next(new Error("Authentication token required"));
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error("JWT_SECRET is not set in environment variables.");
    return next(new Error("Server configuration error"));
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    if (!decoded || typeof decoded !== "object" || !decoded.id) {
      console.error("JWT payload missing user ID");
      return next(new Error("Invalid token payload"));
    }
    socket.user = { id: decoded.id };
    next();
  } catch (e: any) {
    console.error("JWT verification failed:", e.message);
    return next(new Error("Invalid authentication token"));
  }
};
