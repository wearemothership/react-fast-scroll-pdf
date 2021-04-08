import "./App.css";
import React, { SyntheticEvent, useState } from "react";
import { FastScrollPDF } from "react-fast-scroll-pdf";
import { GoClippy, GoMarkGithub } from "react-icons/go";

const App = (): JSX.Element => {
	const [file, setFile] = useState<Uint8Array>();
	const [hideZoom, setHideZoom] = useState<boolean>(false);
	const sourceOptions = {
		data: file
	};

	const [copied, setCopied] = useState(false);
	const copyText = () => {
		navigator.clipboard.writeText("npm install --save react-fast-scroll-pdf");
		setCopied(true);
		setTimeout(() => {
			setCopied(false);
		}, 2000);
	};

	const fileChanged = (ev: SyntheticEvent<HTMLInputElement>) => {
		const target = ev.target as HTMLInputElement;
		const newFile = target.files?.[0];
		if (newFile) {
			const fileReader = new FileReader();

			fileReader.onload = (e) => {
				const { result } = e.target as FileReader;
				const arr = new Uint8Array(result as ArrayBuffer);
				setFile(arr);
			};
			fileReader.readAsArrayBuffer(newFile);
		}
	};

	return (
		<div className="App">
			<section>
				<div className="flex">
					<h1>react-fast-scroll-pdf</h1>
					<p>A fast, efficient PDF renderer.</p>
					<div className="flex flexCenterRow">
						<button
							type="button"
							onClick={() => {
								window.location.href = "https://github.com/wearemothership/react-fast-scroll-pdf";
							}}
							className="yellow"
						>
							<GoMarkGithub />
							View on Github
						</button>
						<button
							type="button"
							className="blue"
							onClick={copyText}
						>
							<GoClippy />
							npm install --save react-fast-scroll-pdf
						</button>
						{copied && <small>Copied…</small>}
					</div>
				</div>
			</section>

			<section>
				<div className="flex flexCenterRow flexSpaced100">
					<input name="pdfFile" type="file" onChange={fileChanged} />
					<label htmlFor="hideZoom">
						<small>Zoom Buttons: </small>
						<input name="hideZoom" type="checkbox" checked={hideZoom} onChange={() => setHideZoom(!hideZoom)} />
					</label>
				</div>
			</section>

			<section>
				<div className="flex flexCenterRow pdfScrollContainer">
					{ file
						? (
							<FastScrollPDF
								className="fastScroll"
								source={sourceOptions}
								hideZoom={hideZoom}
							/>
						)
						: null }
				</div>
			</section>

			<section>
				<div className="flex flexCenterRow flexWrap">
					<button
						type="button"
						onClick={() => {
							window.location.href = "https://wearemothership.com";
						}}
					>
						<small>
							Made by Mothership
						</small>
					</button>
				</div>
			</section>

		</div>
	);
};

export default App;
