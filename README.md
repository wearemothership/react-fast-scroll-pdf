# react-fast-scroll-pdf

> Image-based PDF viewer using pdfjs

[![NPM](https://img.shields.io/npm/v/react-fast-scroll-pdfsvg)](https://www.npmjs.com/package/react-fast-scroll-pdf) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

# Background
I needed a way to very quickly render a complete PDF document but without using a lot of canvas elements (iPads etc limit the amount of canvas memory). This uses a single canvas element 
and uses pdfjs-dist to render each pdf page before converting it to a jpeg image. PDF annotations are then placed on top of the image so that links etc still work.

## Install
```bash
npm install --save @wearemothership/react-fast-scroll-pdf
```

## Run the built-in example
From the main src folder run:
```bash
npm install
npm run example
```

## Usage

You can import the usePDF hook element into React as below (see Example above to see this running)
```jsx
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
			changeZoom({ scale: newZoom })
		}
	}

	const zoomOut = () => {
		const newZoom = zoom - ZOOM_CHANGE;
		if (newZoom < 2) {
			setZoom(newZoom);
			changeZoom({ scale: newZoom })
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
```

### Arguments
- usePDF takes the following possible arguments: 
- source: a PDFJS source object (see below)
- loadingImage: (optional) an image that will be spun in the middle of loading pages (default: Font Awesome Spinner).
- quality: (optional) jpeg image quality between 1 and 100. (default: 80)
- enableAnnotations: (optional) whether to create an annotations layer. (default: true)

### Returns
pages: a fragment of Placeholder pages or PDFPages (as images) as div & img elements

#### Advanced Options
##### On Zoom: Reload current page first
When calling changeZoom a refs can be passed to the function which will force the images for the current page and the next page to be reloaded first, before all other pages.
In the example above, this would be done as follows: 

```jsx
changeZoom({ scale: newScale, viewer: viewerRef.current, scrollContainer: scrollContainerRef.current })
```
