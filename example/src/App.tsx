import React, { SyntheticEvent, useRef, useState } from 'react';
import { usePDF } from "pdf-viewer";

const App = (): JSX.Element => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
	const viewerRef = useRef<HTMLDivElement>(null);
	const [zoom, setZoom] = useState<number>(1);
	const [file, setFile] = useState<Uint8Array>();
	const sourceOptions = {
		data: file
	}
	const { pages, changeZoom } = usePDF({
		source: sourceOptions
	})
	const ZOOM_CHANGE: number = 0.1;

	const zoomIn = () => {
		const newZoom = zoom + ZOOM_CHANGE;
		if (newZoom > 0) {
			setZoom(newZoom);
			changeZoom({ scale: newZoom, scrollContainer: scrollContainerRef.current, viewer: viewerRef.current })
		}
	}

	const zoomOut = () => {
		const newZoom = zoom - ZOOM_CHANGE;
		if (newZoom < 2) {
			setZoom(newZoom);
			changeZoom({ scale: newZoom, scrollContainer: scrollContainerRef.current, viewer: viewerRef.current })
		}
	}

	const fileChanged = (ev: SyntheticEvent<HTMLInputElement>) => {
		const target = ev.target as HTMLInputElement;
		const file = target.files?.[0]
		if (file) {
			var fileReader = new FileReader();  

			fileReader.onload = (e) => {
				const { result } = e.target as FileReader;
				const arr = new Uint8Array(result as ArrayBuffer);
				setFile(arr);
			};
			fileReader.readAsArrayBuffer(file);
		}
	}

	return (
		<div className="App">
			<input type="file" onChange={fileChanged} />
			<div id="scrollContainer" ref={scrollContainerRef} style={{ overflow: "scroll", height: "800px" }}>
				<div id="viewer" ref={viewerRef}>
					{pages}
				</div>
			</div>
			<button type="button" onClick={zoomIn}>+</button>
			<button type="button" onClick={zoomOut}>-</button>
		</div>
	);
}

export default App;
