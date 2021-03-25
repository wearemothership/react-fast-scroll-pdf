import React, { SyntheticEvent, useState } from "react";
import { FastScrollPDF } from "react-fast-scroll-pdf";
import styles from "./App.module.css";

const App = (): JSX.Element => {
	const [file, setFile] = useState<Uint8Array>();
	const [quality, setQuality] = useState<string>("80");
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

	const qualityChanged = (ev: SyntheticEvent<HTMLInputElement>) => {
		const target = ev.target as HTMLInputElement;
		const newQuality = target.value;
		setQuality(newQuality);
		const num = parseInt(newQuality, 10);
		if (!Number.isNaN(num) && num >= 1 && num <= 100) {
			target.className = styles.valid;
		}
		else {
			target.className = styles.invalid;
		}
	};

	const numQuality = parseInt(quality, 10);
	const isValidQuality = !Number.isNaN(numQuality) && numQuality >= 1 && numQuality <= 100;

	return (
		<div className={styles.app}>
			<div className={styles.settingsDiv}>
				<label htmlFor="pdfFile">
					<span>Choose File: </span>
					<input name="pdfFile" type="file" onChange={fileChanged} />
				</label>
				<label htmlFor="pdfQuality">
					<span>Quality (1-100): </span>
					<input name="pdfQuality" type="text" className={styles.valid} value={quality} onChange={qualityChanged} />
				</label>
			</div>
			{ file
				? (
					<FastScrollPDF
						className={styles.fastScroll}
						source={sourceOptions}
						quality={isValidQuality ? quality : 80}
					/>
				)
				: null }
		</div>
	);
};

export default App;
