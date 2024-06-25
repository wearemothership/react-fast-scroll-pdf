import "./App.css";
import React, { SyntheticEvent, useState } from "react";
import { FastScrollPDF } from "react-fast-scroll-pdf";
import { FaGithub, FaFilePdf } from "react-icons/fa";
import { GoRepo } from "react-icons/go";
import example1 from "./example1.pdf";

interface IExampleFileButton {
	fileName: string,
	selectedFile?: string,
	file: string,
	loadFile: (fileName: string, file: string) => void
}

const ExampleFileButton = ({
	fileName, selectedFile, loadFile, file
}: IExampleFileButton) => {
	const selected = fileName === selectedFile;
	return (
		<button type="button" onClick={() => loadFile(fileName, file)} className={selected ? "selected" : ""}>
			<FaFilePdf />
			{fileName}
		</button>
	);
};

ExampleFileButton.defaultProps = {
	selectedFile: ""
};

const App = (): JSX.Element => {
	const [file, setFile] = useState<Uint8Array>();
	const [fileName, setFileName] = useState<string>();
	const [hideZoom, setHideZoom] = useState<boolean>(false);
	const [showFitPage, setShowFitPage] = useState<boolean>(false);
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
				setFileName(newFile.name);
			};
			fileReader.readAsArrayBuffer(newFile);
		}
	};

	const loadFile = (newFileName: string, newFile: string) => {
		fetch(newFile).then((response) => response.arrayBuffer().then((buff) => {
			const arr = new Uint8Array(buff as ArrayBuffer);
			setFile(arr);
			setFileName(newFileName);
		}));
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
							<FaGithub />
							View on Github
						</button>
						<button
							type="button"
							className="blue"
							onClick={copyText}
						>
							<GoRepo />
							npm install --save react-fast-scroll-pdf
						</button>
						{copied && <small>Copied…</small>}
					</div>
				</div>
			</section>
			<section>
				<div className="flex flexCenterRow flexWrap">
					<div className="buttons">
						<ExampleFileButton fileName="example1.pdf" selectedFile={fileName} loadFile={loadFile} file={example1} />
					</div>
					<input name="pdfFile" type="file" onChange={fileChanged} />
				</div>
			</section>

			<section>
				<div className="flex flexCenterRow flexSpaced100">
					<label htmlFor="hideZoom">
						<small>Hide Zoom Buttons: </small>
						<input name="hideZoom" type="checkbox" checked={hideZoom} onChange={() => setHideZoom(!hideZoom)} />
					</label>
				</div>
				<div className="flex flexCenterRow flexSpaced100">
					{ !hideZoom ? (
						<label htmlFor="showFitPage">
							<small>Show Fit Page: </small>
							<input name="showFitPage" type="checkbox" checked={showFitPage} onChange={() => setShowFitPage(!showFitPage)} />
						</label>
					) : null }
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
								showFitPage={showFitPage}
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
