import React, { SyntheticEvent, useState } from "react";
import { FastScrollPDF } from "react-fast-scroll-pdf";
import Flex from "./components/Flex";
import { GoClippy, GoMarkGithub, GoDashboard, GoSync, GoAlert, GoFileMedia } from "react-icons/go";
import styles from "./App.module.css";

const App = (): JSX.Element => {
	const [file, setFile] = useState<Uint8Array>();
	const [hideZoom, setHideZoom] = useState<boolean>(false);
	const sourceOptions = {
		data: file
	};

	const [copied, setCopied] = useState(false);
	const copyText = () => {
		navigator.clipboard.writeText("npm install --save dicom.js");
		setCopied(true);
		setTimeout(() => {
			setCopied(false);
		}, 2000);
	}

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
				<h1>dicom.js</h1>
				<p>A small, super-fast javascript DICOM renderer.</p>
				<Flex
					flexDirection="row"
					alignItems="center"
				>
					<button onClick={() =>  window.location.href="https://github.com/wearemothership/dicom.js"} className="yellow"><GoMarkGithub /> View on Github</button>
					<button className="blue"  onClick={copyText}><GoClippy /> npm install --save dicom.js</button>
					{copied && <small>Copied…</small>}
				</Flex>
			</Flex>
		</section>

		<section>
			<Flex
				flexDirection="row"
				alignItems="center"
				flexWrap="wrap"
			>
				<div className="buttons">
					{/* <ExampleFileButton fileName="jpeg-baseline.dcm" selectedFile={fileName} loadFile={loadFile}/>
					<ExampleFileButton fileName="jpeg-2000-lossless.dcm" selectedFile={fileName} loadFile={loadFile}/>
					<ExampleFileButton fileName="greyscale-with-lut.dcm" selectedFile={fileName} loadFile={loadFile}/>
					<ExampleFileButton fileName="greyscale-windowed.dcm" selectedFile={fileName} loadFile={loadFile}/> */}
				</div>
				<input name="pdfFile" type="file" onChange={fileChanged} />
			</Flex>
		</section>


		<section>
			<Flex
				flexDirection="row"
				justifyContent="center"
				width="100%"
			>
				{ file
				? (
					<FastScrollPDF className={styles.fastScroll} source={sourceOptions} hideZoom={hideZoom} />
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
				<Link to={"https://wearemothership.com"} onClick={ () => window.location.href="https://wearemothership.com" }><small>Made by Mothership</small></Link>
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
		// 			<input name="hideZoom" type="checkbox" className={styles.valid} checked={hideZoom} onChange={() => setHideZoom(!hideZoom)} />
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
