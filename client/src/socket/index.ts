import { useState, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useNavigate } from "react-router";
import useLocalStorage from "../hooks/useLocalStorage";
import { useRefreshTokenMutation } from "../Auth/query/authQuery";
import { type Message } from "../ConversationsPage/types";
import { useAuthStore } from "../store/useAuthStore";

const VITE_BACKEND_URL_FOR_SOCKET = import.meta.env.VITE_BACKEND_URL;
const VITE_FALLBACK_PORT_FOR_SOCKET =
  import.meta.env.VITE_CLIENT_FALLBACK_PORT || "8080";
const SOCKET_SERVER_URL =
  //  "https://murmur-backend-5zvw.onrender.com";
  VITE_BACKEND_URL_FOR_SOCKET && VITE_BACKEND_URL_FOR_SOCKET.trim() !== ""
    ? VITE_BACKEND_URL_FOR_SOCKET.trim()
    : `http://localhost:${VITE_FALLBACK_PORT_FOR_SOCKET}`;

export default function useSocketConnect(
  handleSocketReceivedMessage: (data: Message) => void
) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const [accessToken, setAccessToken] = useLocalStorage<string | null>(
    "accessToken",
    null
  );
  const [refreshToken, setRefreshToken] = useLocalStorage<string | null>(
    "refreshToken",
    null
  );
  const navigate = useNavigate();

  const { setUser } = useAuthStore();

  const refreshTokenMutation = useRefreshTokenMutation(
    (data) => {
      console.log("Token refreshed successfully");
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
    },
    () => {
      console.error("Failed to refresh token. Redirecting to login.");
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
      navigate("/");
    }
  );

  const mutateRefreshToken = useCallback((refreshToken: string | null) => {
    if (!refreshTokenMutation.isPending && refreshToken) {
      refreshTokenMutation.mutate(refreshToken);
    }
  }, []);

  useEffect(() => {
    if (!accessToken) {
      console.warn("No access token available for socket connection.");
      setSocket(null);
      setIsConnected(false);

      if (!refreshToken) {
        console.error("No access or refresh token found. Redirecting.");
        navigate("/");
      }
      return;
    }

    console.log("Attempting to connect socket...");

    const newSocket = io(SOCKET_SERVER_URL, {
      auth: {
        token: accessToken,
      },
      transports: ["websocket"],
      autoConnect: false,
    });

    newSocket.on("connect", () => {
      console.log("Socket connected!", newSocket.id);
      setIsConnected(true);
      setSocket(newSocket);
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      setIsConnected(false);

      if (err.message === "Authentication token has expired") {
        console.log(
          "Auth failed. Token expired. Attempting to refresh token..."
        );
        mutateRefreshToken(refreshToken);
      } else if (
        err.message === "Authentication token required" ||
        err.message === "Invalid authentication token" ||
        err.message === "Invalid token payload"
      ) {
        console.log(
          "Authentication failed, Invalid auth token - redirecting to login"
        );
        newSocket.disconnect();
        navigate("/");
      } else {
        console.error("Other socket connection error:", err);
      }
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setIsConnected(false);
      setSocket(null);
    });

    newSocket.on("receiveMessage", (data: Message) => {
      console.log("Received message from socket - ", data);
      handleSocketReceivedMessage(data);
    });

    newSocket.connect();

    return () => {
      console.log("Cleaning up socket in useEffect cleanup");
      newSocket.offAny();
      newSocket.disconnect();
      setIsConnected(false);
    };
  }, [
    accessToken,
    refreshToken,
    navigate,
    mutateRefreshToken,
    handleSocketReceivedMessage,
  ]);

  return { socket, isConnected };
}
