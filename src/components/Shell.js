import React from 'react'
import { useState } from 'react';

const Shell = ({ code }) => {
	const output = code["code"]
	const [input, setInput] = useState("")

	const sendInput = (e) => {
		localStorage.setItem("input", e.target.value)

			
	}
  return (
		<div>
			<hr />
			<div className="flex flex-col">
				<div className="w-full">
					<div className="bg-gray-900 h-5 text-sm pl-3 mt-1">
						<h2 className="font-bold">Input</h2>
					</div>
					<div className="content ">
						<textarea
							className="w-full h-64 bg-gray-700 focus:border-none"
							name="textarea"
							id="textarea"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onMouseLeave={sendInput}
						></textarea>
					</div>
				</div>
				<div className="w-full mt-3">
					<div className="bg-gray-900 h-5 text-sm pl-3 mt-1 flex">
						<h2 className="font-bold">Output</h2>
					</div>

					<div className="content ">
						<textarea
							className="w-full h-80 bg-gray-700 focus:border-none"
							name="textarea"
						  value={output}
							id="textarea"
						></textarea>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Shell