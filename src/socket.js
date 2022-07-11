import { io } from "socket.io-client";

export const initSocket = async () => {
	const options = {
		"force new connection": true,
		reconnectionAttempt: "Infinity",
		timeout: 10000,
		transports: ["websocket"],
		upgrade: false,
	};
	return io("http://localhost:3000", options);
};
