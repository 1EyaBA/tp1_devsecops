import { io } from "socket.io-client";

// Replace with your backend URL/port if different
const socket = io("http://localhost:3000", {
  transports: ["websocket"],
});

export default socket;
