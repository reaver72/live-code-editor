import React, { useState } from "react";
import { v4 as uuid } from "uuid";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
const Home = () => {
	const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate()
	const generateId = () => {
		const roomId = uuid();
		setRoomId(roomId);

		toast.success("New room created!");
  };
  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("Room Id & username is required!")
      return
    }
    navigate(`/editor/${roomId}`, {
      state: {
      username
    }
  })
  }
  const enterRoom = (e) => {
    if (e.code === "Enter") {
      joinRoom()
    }
  }
	return (
		<div className="flex justify-center items-center mt-40">
			<div className="bg-gray-700 rounded-lg p-5 text-white max-w-sm">
				<img
					className="w-6/12 mb-2"
					src="http://ww1.prweb.com/prfiles/2013/04/09/10616110/LiveCodeCommunityLogo.png"
					alt=""
				/>
				<h3 className="text-sm mb-2">Paste invitation ROOM ID</h3>
				<input
					className="rounded-lg text-black mb-3 w-full"
					type="text"
					placeholder="Room Id"
					value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          onKeyUp={enterRoom}
				/>
				<br />
				<input
					className="rounded-lg text-black w-full mb-2 text-md"
					type="text"
					placeholder="username"
					value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyUp={enterRoom}
				/>
				<br />
				<div className="flex justify-end">
					<button onClick={joinRoom} className="bg-green-600 mb-3 mt-1 rounded-md px-4 py-1 hover:bg-green-700 active:bg-green-600 transition ease-300">
						Join
					</button>
				</div>
				<h2 className="text-center">
					If you don't have an invite room then create
					<span className="text-blue-500 hover:text-blue-400 active:text-blue-500 transition ease-300">
						<button onClick={generateId}>new room</button>
					</span>
				</h2>
			</div>
		</div>
	);
};

export default Home;
