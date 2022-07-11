import React from 'react'
import "./App.css"
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from "./pages/Home"
import EditorPage from "./pages/EditorPage"
import { ToastContainer } from "react-toastify";
const App = () => {
  return (
		<>
			<div>
				<ToastContainer
					position="top-right"
					autoClose={2200}
					hideProgressBar={false}
					newestOnTop={false}
					closeOnClick
					rtl={false}
					pauseOnFocusLoss
					draggable
					pauseOnHover
				/>
				;
			</div>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/editor/:roomId" element={<EditorPage />} />
				</Routes>
			</BrowserRouter>
		</>
	);
}

export default App