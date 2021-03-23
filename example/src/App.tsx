import React, { SyntheticEvent, useState } from "react";
import { FastScrollPDF } from "react-fast-scroll-pdf";

const App = (): JSX.Element => {
	const [file, setFile] = useState<Uint8Array>();
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
		<div className="App">
			<input type="file" onChange={fileChanged} />
			{ file ? <FastScrollPDF source={sourceOptions} /> : null }
		</div>
	);
};

export default App;
