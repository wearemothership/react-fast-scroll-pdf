import "./App.css";
import React, { SyntheticEvent, useState } from "react";
import { Link } from "react-router-dom";
import { FastScrollPDF } from "react-fast-scroll-pdf";
import { GoClippy, GoMarkGithub } from "react-icons/go";
import Flex from "./components/Flex";

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
				<Flex>
					<h1>react-fast-scroll-pdf</h1>
					<p>A fast, efficient PDF renderer.</p>
					<Flex
						flexDirection="row"
						alignItems="center"
					>
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
					</Flex>
				</Flex>
			</section>

			<section>
				<Flex
					flexDirection="row"
					alignItems="center"
					justifyContent="space-between"
					width="100%"
				>
					<input name="pdfFile" type="file" onChange={fileChanged} />
					<label htmlFor="hideZoom">
						<small>Zoom Buttons: </small>
						<input name="hideZoom" type="checkbox" checked={hideZoom} onChange={() => setHideZoom(!hideZoom)} />
					</label>
				</Flex>
			</section>

			<section>
				<Flex
					flexDirection="row"
					justifyContent="center"
					width="100%"
					backgroundColor="rgb(242, 242, 242)"
					padding="2rem"
				>
					{ file
						? (
							<FastScrollPDF
								className="fastScroll"
								source={sourceOptions}
								hideZoom={hideZoom}
							/>
						)
						: null }
				</Flex>
			</section>

			<section>
				<Flex
					flexDirection="row"
					alignItems="center"
					flexWrap="wrap"
				>
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
				</Flex>
			</section>

		</div>
	// <div className={styles.app}>
	// 	<div className={styles.settingsDiv}>
	// 		<label htmlFor="pdfFile">
	// 			<span>Choose File: </span>
	// 			<input name="pdfFile" type="file" onChange={fileChanged} />
	// 		</label>
	// 		<label htmlFor="hideZoom">
	// 			<span>Hide Zoom Buttons: </span>
	// 			<input name="hideZoom" type="checkbox" className={styles.valid} checked={hideZoom}
	// onChange={() => setHideZoom(!hideZoom)} />
	// 		</label>
	// 	</div>
	// 	{ file
	// 		? (
	// 			<FastScrollPDF className={styles.fastScroll} source={sourceOptions} hideZoom={hideZoom} />
	// 		)
	// 		: null }
	// </div>
	);
};

export default App;
