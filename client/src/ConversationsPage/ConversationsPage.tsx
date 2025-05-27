import React, { useEffect, useState } from "react";
import ConversationsHeader from "./ConversationsHeader";
import ContactList from "./ContactList";
// import ConversationPane from "./ConversationPane";
import { io, Socket } from "socket.io-client";

// Assuming your backend is running locally on port 4000
const SOCKET_SERVER_URL = "http://localhost:4000"; // Use http for Socket.IO

const ConversationsPage: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messageInput, setMessageInput] = useState(""); // State for input field

  useEffect(() => {
    // Get the access token from where you store it (e.g., localStorage)
    const accessToken = localStorage.getItem("accessToken"); // Use the correct key

    if (!accessToken) {
      console.error("No access token found. Cannot connect to socket.");
      // Optionally redirect to login or show error
      return;
    }

    // Establish the socket connection with the authentication token
    const newSocket = io(SOCKET_SERVER_URL, {
      auth: {
        token: accessToken, // Pass the JWT here
      },
      // You might need additional transport options depending on your server setup
      // transports: ['websocket'], // Forcing websocket transport
    });

    // Handle connection events
    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      // Handle authentication failure or other connection issues
      // e.g., redirect to login if token is invalid
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setSocket(null); // Update state on disconnect
    });

    // Add listener for incoming messages (Chunk 4 will use this)
    newSocket.on("message", (msg) => {
      console.log("Message received from server:", msg);
      // Later, update UI to display this message
    });

    setSocket(newSocket); // Store the socket instance in state

    // Clean up the socket connection on component unmount
    return () => {
      if (newSocket) {
        newSocket.disconnect();
        console.log("Socket disconnected on component unmount");
      }
    };
  }, []); // Empty dependency array means this effect runs only once on mount

  // Handler for sending a message
  const handleSendMessage = () => {
    if (socket && messageInput.trim()) {
      console.log("Sending message:", messageInput);
      socket.emit("message", messageInput); // Emit the 'message' event
      setMessageInput(""); // Clear the input field
    }
  };

  return (
    <div className="conversations-page">
      <ConversationsHeader />
      <div className="flex h-[calc(100vh-headerHeight)]">
        <div className="w-1/3 border-r">
          <ContactList />
        </div>
        <div className="w-2/3">
          {/* <ConversationPane /> */}

          <div className="p-4 border-t">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message..."
              className="border p-2 mr-2"
            />
            <button
              onClick={handleSendMessage}
              disabled={!socket || !messageInput.trim()}
              className="bg-blue-500 text-white p-2 rounded"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationsPage;
