import React, { SyntheticEvent, useState } from "react";
import { FastScrollPDF } from "react-fast-scroll-pdf";
import styles from "./App.module.css";

const App = (): JSX.Element => {
	const [file, setFile] = useState<Uint8Array>();
	const [hideZoom, setHideZoom] = useState<boolean>(false);
	const sourceOptions = {
		data: file
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
		<div className={styles.app}>
			<div className={styles.settingsDiv}>
				<label htmlFor="pdfFile">
					<span>Choose File: </span>
					<input name="pdfFile" type="file" onChange={fileChanged} />
				</label>
				<label htmlFor="hideZoom">
					<span>Hide Zoom Buttons: </span>
					<input name="hideZoom" type="checkbox" className={styles.valid} checked={hideZoom} onChange={() => setHideZoom(!hideZoom)} />
				</label>
			</div>
			{ file
				? (
					<FastScrollPDF className={styles.fastScroll} source={sourceOptions} hideZoom={hideZoom} />
				)
				: null }
		</div>
	);
};

export default App;
