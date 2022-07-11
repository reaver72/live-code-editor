import React, { useEffect, useRef, useState } from "react";
import Avatar from "react-avatar";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import Editor from "../components/Editor";
import Shell from "../components/Shell";
import { initSocket } from "../socket";

const EditorPage = () => {
	const socketRef = useRef(null);
	const [code, setCode] = useState("");
	const codeRef = useRef(null);
	const location = useLocation();
	const navigate = useNavigate();
	const { roomId } = useParams();
	const [clients, setClients] = useState([]);

	const testCode = async (codes) => {
		setCode(codes);
	};
	const copyRoomId = async () => {
		await navigator.clipboard.writeText(roomId);
		toast.success("Room id copied to clipboard");
	};
	const leaveRoom = () => {
		navigate("/");
	};
	useEffect(() => {
		const init = async () => {
			socketRef.current = await initSocket();
			socketRef.current.on("connect_error", (err) => handleErrors(err));
			socketRef.current.on("connect_failed", (err) => handleErrors(err));
			function handleErrors(e) {
				console.log("error", e);
				toast.error("Socket connection failed!");
				navigate("/");
			}
			socketRef.current.emit("join", {
				roomId,
				username: location.state?.username,
			});

			socketRef.current.on("joined", ({ clients, username, socketId }) => {
				setClients(clients);
				socketRef.current.emit("newUser-code-sync", {
					code: codeRef.current,
					socketId,
				});
			});

			socketRef.current.on(
				"disconnected",
				({ socketId, username, numOfConnection }) => {
					localStorage.setItem("numOfConnectedUsers", numOfConnection);
					setClients((prev) => {
						return prev.filter((client) => client.socketId !== socketId);
					});
				}
			);
		};
		init();
		return () => {
			socketRef.current.off("joined");
			socketRef.current.off("disconnect");
			socketRef.current.disconnect();
		};
	}, [code]);
	return (
		<div className="grid grid-cols-9 text-white -mt-6">
			<div className="col-span-2 min-h-min pb-3 mb-2 bg-gray-900">
				<div className="flex justify-center align-center flex-wrap mt-4">
					<img
						className="w-8/12 mb-2"
						src="http://ww1.prweb.com/prfiles/2013/04/09/10616110/LiveCodeCommunityLogo.png"
						alt=""
					/>
					<hr className="w-10/12" />
				</div>
				<h3 className="font-semibold text-center text-lg ">Connected Users</h3>

				<div className="flex justify-between flex-col h-4/5">
					<div className="clients">
						{clients.map(({ username, socketId }) => {
							return (
								<Avatar
									key={socketId}
									className="m-1"
									name={username}
									size="48"
									round={true}
								/>
							);
						})}
					</div>
					<div className="buttons mb-6 flex flex-wrap justify-center align-center">
						<button
							onClick={copyRoomId}
							className="bg-white px-10 py-2 text-black rounded-lg mb-3 mx-3 hover:bg-gray-200 active:bg-white transition ease-300"
						>
							Copy RoomId
						</button>
						<button
							onClick={leaveRoom}
							className="bg-red-500 px-12 py-2 rounded-lg mx-3 hover:bg-red-600 active:bg-red-500 transition ease-300"
						>
							Leave Room
						</button>
					</div>
				</div>
			</div>
			<div className="col-span-5 my-2 mx-1">
				<Editor
					testCode={testCode}
					socketRef={socketRef}
					roomId={roomId}
					onCodeChange={(code) => (codeRef.current = code)}
				/>
			</div>
			<div className="col-span-2 mr-1">
				<Shell code={code} />
			</div>
		</div>
	);
};

export default EditorPage;
