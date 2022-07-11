import React, { useEffect, useRef, useState } from "react";
import codemirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/theme/darcula.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/php/php";
import "codemirror/mode/python/python";
import "codemirror/mode/clike/clike";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/comment/comment";
import "codemirror/addon/hint/show-hint";
import "codemirror/addon/hint/show-hint";
import "codemirror/addon/hint/javascript-hint";
import "codemirror/addon/hint/anyword-hint";
import "codemirror/addon/edit/closebrackets";
import { IoIosPlay } from "react-icons/io";
import { AiTwotoneSave } from "react-icons/ai";
import axios from "axios";
import { toast } from "react-toastify";

localStorage.setItem(
	"boilerPlate",
	JSON.stringify({
		javascript:
			localStorage.getItem("javascript") || 'console.log("Hello World!")',
		python: localStorage.getItem("python") || 'print("Hello World!")',
		"node.js": 'console.log("Hello World!")',
		php: localStorage.getItem("php") || '<?php\n\techo("Hello World!");\n?>',
		C:
			localStorage.getItem("C") ||
			'#include <stdio.h>\n\nint main() {\n\tprintf("Hello, World!");\n\treturn 0;\n}',
		"C++":
			localStorage.getItem("C++") ||
			'#include <iostream>\n int main() {\n\tstd::cout << "Hello, World!";\n\treturn 0;\n}',
		Java:
			localStorage.getItem("Java") ||
			'public class Main {\n\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello, World!");\n\t}\n}',
		"C#":
			localStorage.getItem("C#") ||
			'namespace HelloWorld\n{\n\tclass Hello {\n\t\tstatic void Main(string[] args)\n\t\t{\n\t\t\tSystem.Console.WriteLine("Hello World!");\n\t\t}\n\t}\n}',
	})
);
const boilerPlate = JSON.parse(localStorage.getItem("boilerPlate"));
localStorage.setItem(
	"langMode",
	JSON.stringify({
		1: "javascript",
		2: "python",
		3: "php",
		4: "C",
		5: "C++",
		6: "Java",
		7: "C#",
	})
);

const langMode = JSON.parse(localStorage.getItem("langMode"));

const Editor = ({ socketRef, roomId, onCodeChange, testCode }) => {
	const editorRef = useRef(null);

	const runCode = async () => {
		const { data } = await axios.post("http://localhost:3000/runcode", {
			data: editorRef.current.getValue(),
			language: localStorage.getItem("selectedMode"),
			inp: localStorage.getItem("input"),
		});
		if (data) {
			await testCode(data);
		}
	};

	const saveCode = () => {
		const code = editorRef.current.getValue();
		const mode = localStorage.getItem("selectedMode");
		localStorage.setItem(mode, code);
		toast.success("Code saved successfully");
	};
	const changeLanguage = (e) => {
		const mode = e.target.value;

		localStorage.setItem("selectedMode", mode);
		window.location.reload(true);
	};

	useEffect(() => {
		async function init() {
			editorRef.current = codemirror.fromTextArea(
				document.getElementById("codeArea"),
				{
					mode:
						localStorage.getItem("selectedMode") == "C"
							? "text/x-csrc"
							: localStorage.getItem("selectedMode") == "C++"
							? "text/x-c++src"
							: localStorage.getItem("selectedMode") == "Java"
							? "text/x-java"
							: localStorage.getItem("selectedMode") == "C#"
							? "text/x-csharp"
							: {
									name: localStorage.getItem("selectedMode") || "javascript",
									json: true,
							  },

					theme: "dracula",
					autoCloseTags: true,
					autoCloseBrackets: true,
					lineNumbers: true,
					autocorrect: true,

					extraKeys: {
						"Ctrl-Space": "autocomplete",
					},
					indentWithTabs: true,
					autofocus: true,
				}
			);
			editorRef.current.on("change", (instance, changes) => {
				const code = instance.getValue();
				const { origin } = changes;
				onCodeChange(code);
				if (origin !== "setValue") {
					socketRef.current.emit("code-changed", {
						roomId,
						code,
					});
				}
			});

			editorRef.current.setValue(
				boilerPlate[localStorage.getItem("selectedMode")] || "console.log('Hello World!')"
			);
		}

		init();
		return () => {};
	}, []);

	useEffect(() => {
		if (socketRef.current) {
			socketRef.current.on("sync-code", ({ code }) => {
				editorRef.current.setValue(code);
			});
		}
		return () => {
			socketRef.current.off("sync-code");
		};
	}, [socketRef.current]);
	return (
		<>
			<div className="flex align-center justify-between px-3">
				<div>
					<button
						onClick={runCode}
						className="bg-green-700 rounded-lg px-3 py-1 mb-2"
					>
						Run <IoIosPlay className="mb-1 inline" />
					</button>
					<button
						onClick={saveCode}
						className="bg-purple-500 ml-3 rounded-lg px-3 py-1 mb-2"
					>
						Save <AiTwotoneSave className="mb-1 inline" />
					</button>
				</div>
				<div className="flex gap-3">
					<h2 className="mt-2 text-lg font-semibold">Select Language</h2>
					<select
						onChange={changeLanguage}
						className="rounded-lg bg-gray-700 text-white"
						name=""
						id=""
					>
						<option value={localStorage.getItem("selectedMode") || "javascript"}>
							{localStorage.getItem("selectedMode") || "javascript"}
						</option>
						<option value={langMode[1]}>{langMode[1]}</option>
						<option value={langMode[2]}>{langMode[2]}</option>
						<option value={langMode[3]}>{langMode[3]}</option>
						<option value={langMode[4]}>{langMode[4]}</option>
						<option value={langMode[5]}>{langMode[5]}</option>
						<option value={langMode[6]}>{langMode[6]}</option>
						<option value={langMode[7]}>{langMode[7]}</option>
					</select>
				</div>
			</div>
			<textarea name="" id="codeArea"></textarea>
		</>
	);
};

export default Editor;
