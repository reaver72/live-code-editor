const express = require("express");
const app = express();
const cors = require("cors");
const fs = require("fs").promises;
const createReadStream = require("fs").createReadStream;
const { v4: uuid } = require("uuid");
const { spawn } = require("node:child_process");

const port = 3000;
const server = require("http").createServer(app);

const { Server } = require("socket.io");
const fileName = uuid();

// middlewares
app.use(cors());
app.use(express.json());

// routes
app.post("/runcode", async (req, res) => {
	console.log(req.body);
	const { language } = req.body;
	const { inp } = req.body;
	try {
		if (inp) {
			await fs.writeFile(`${fileName}.txt`, inp);
		}
	} catch (error) {
		console.log(error);
	}

	await fs.writeFile(
		`${fileName}.${
			language == "python"
				? "py"
				: language == "Java"
				? "java"
				: language == "C++" || language == "C"
				? ".cpp"
				: language == "C#"
				? "cs"
				: language == "php"
				? "php"
				: "js"
		}`,
		req.body.data
	);
	const run = spawn(
		`${
			language == "python"
				? "python"
				: language == "Java"
				? "java"
				: language == "C++" || language == "C"
				? "g++"
				: language == "C#"
				? "csc"
				: language == "php"
				? "php"
				: "node"
		} ${fileName}.${
			language == "python"
				? "py"
				: language == "Java"
				? "java"
				: language == "C++" || language == "C"
				? ".cpp"
				: language == "C#"
				? "cs"
				: language == "php"
				? "php"
				: "js"
		} ${language == "C++" || language == "C" || language == "C#" ? "&&" : ""} ${
			language == "C++" || language == "C" ? "a.exe" : fileName
		}`,
		[],
		{
			stdio: "pipe",
			shell: true,
		}
	);

	let dataToBeSent = "";
	run.stdout.on("data", (data) => {
		const newData = data.toString();
		dataToBeSent += `${newData}\n`;
	});
	run.stderr.on("data", (data) => {
		const errData = data.toString();
		dataToBeSent += `${errData}\n`;
	});
	if (inp) {
		const file = createReadStream(`${fileName}.txt`);
		file.pipe(run.stdin);
	}
	run.on("close", () => {
		res.json({ code: dataToBeSent });
		if (inp) {
			fs.unlink(`${fileName}.txt`, (err) => {
				if (err) console.log(err);
			});
		}
		fs.unlink(
			`${fileName}.${
				language == "python"
					? "py"
					: language == "Java"
					? "java"
					: language == "C++" || language == "C"
					? ".cpp"
					: language == "C#"
					? "cs"
					: language == "php"
					? "php"
					: "js"
			}`,
			(err) => {
				if (err) console.log(err);
			}
		);
	});
});
const io = new Server(server);
const getAllConnectedClients = (roomId) => {
	return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
		(socketId) => {
			return {
				socketId,
				username: userSocketMap[socketId],
			};
		}
	);
};
const userSocketMap = {};
io.on("connection", (socket) => {
	let numOfConnection = socket.adapter.sids.size;
	console.log("connection", numOfConnection);
	socket.on("join", ({ roomId, username }) => {
		userSocketMap[socket.id] = username;
		socket.join(roomId);
		const clients = getAllConnectedClients(roomId);
		clients.forEach(({ socketId }) => {
			io.to(socketId).emit("joined", {
				clients,
				username,
				socketId: socket.id,
				numOfConnection,
			});
		});
	});

	socket.on("code-changed", ({ roomId, code }) => {
		socket.in(roomId).emit("sync-code", {
			code,
			numOfConnection,
		});
	});
	socket.on("newUser-code-sync", ({ socketId, code }) => {
		io.to(socketId).emit("sync-code", {
			code,
		});
	});

	socket.on("disconnecting", () => {
		const rooms = [...socket.rooms];
		console.log("socket disconnected", socket.id);
		console.log("rooms", rooms);
		numOfConnection = socket.adapter.sids.size - 1;
		rooms.forEach((roomId) => {
			socket.in(roomId).emit("disconnected", {
				socketId: socket.id,
				username: userSocketMap[socket.id],
				numOfConnection,
			});
		});
		delete userSocketMap[socket.id];
		socket.leave();
	});
});

server.listen(port, () => {
	console.log("server running on port", port);
});
// httpServer.listen(5001,"httpServer on port 5001")
