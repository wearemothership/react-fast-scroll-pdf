# react-fast-scroll-pdf

> Image-based PDF viewer using pdfjs

[![NPM](https://img.shields.io/npm/v/react-fast-scroll-pdf.svg)](https://www.npmjs.com/package/react-fast-scroll-pdf) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

# Background
I needed a way to very quickly render a complete PDF document but without using a lot of canvas elements (iPads etc limit the amount of canvas memory). This uses a single canvas element 
and uses pdfjs-dist to render each pdf page before converting it to a PNG image. PDF annotations are then placed on top of the image so that links etc still work.

## Install
```bash
npm install --save react-fast-scroll-pdf
```

## Run the built-in example
From the main src folder run:
```bash
npm install
npm run example
```

## Usage

### Most simple - use the built in FastScrollPDF Component
Imply import the FastScrollPDF component and pass in the required props
```jsx
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
```
### Medium difficulty - use the inidividual components
This is something that you may wish to do if you want to apply your own styles or get access to the individual components to sort layout out in your own way. Here you're going to use the 
components along with the hook to give you lots of control over how you display the PDF. 

#### Note
For reloading the PDF effeciently you should pass in refs to the PDFDocument component and then use those refs for changeZoom. If you choose not to use the refs, it will all still work 
but instead of reloading from the currently active page, it will reload from page 1.
```jsx
import React, { SyntheticEvent, useState } from "react";
import { ZoomButtons, PDFDocument, usePDF } from "react-fast-scroll-pdf";

const App = (): JSX.Element => {
	const [file, setFile] = useState<Uint8Array>();
	const sourceOptions = {
		data: file
	};
	const scrollContainerRef = useRef();
	const viewerRef = useRef();
	const { pages, changeZoom } = usePDF({ source });

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

	const zoomChange = (newZoom: number) => {
		changeZoom({
			scale: newZoom, viewer: viewerRef.current, scrollContainer: scrollContainerRef.current
		});
	};

	return (
		<div className="App">
			<input type="file" onChange={fileChanged} />
			<ZoomButtons zoomChange={zoomChange} />
			<PDFDocument scrollContainerRef={scrollContainerRef} viewerRef={viewerRef} pages={pages} />
		</div>
	);
};

export default App;
```

### Hardest - Write your own code and use the hook!

You can import the usePDF hook element into React as below (see Example above to see this running)
```jsx
import React, { SyntheticEvent, useRef, useState } from 'react';
import { usePDF } from "react-fast-scroll-pdf";

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
			changeZoom({
				scale: newZoom, viewer: viewerRef.current, scrollContainer: scrollContainerRef.current
			});
		}
	}

	const zoomOut = () => {
		const newZoom = zoom - ZOOM_CHANGE;
		if (newZoom < 2) {
			setZoom(newZoom);
			changeZoom({
				scale: newZoom, viewer: viewerRef.current, scrollContainer: scrollContainerRef.current
			});
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

## PDFPage and PlaceholderPage
These two components can be accessed via an import and may be useful if you wish to add additional pages to the page list returned by the usePDF hook.

## Props
### FastScrollPDF
- source: (required) a PDFJS source object (see below)
- loadingImage: (optional) an image that will be spun in the middle of loading pages (default: spinner gif - courtesy of <a href="https://icons8.com/" targe="_blank">icons8</a>).
- spinLoadingImage: (optional) Whether to spin the loading image (default: false)
- enableAnnotations: (optional) whether to create an annotations layer. (default: true),
- className: (optional) a CSS class to apply to the main window. (default: none),
- hideZoom: (optional) if true, the zoom buttons are hidden. (default: false)

### PDFDocument
- pages: (required) The list of pages returned from the usePDF hook.
- scrollContainerRef: (optional) a ref object to store a ref to the div set to be used for scrolling.
- viewerRef: (optional) a ref object to store a ref to the div which contains all the pages (usually a child of scrollContainer).
- className: (optional) a class to apply to the document div.

### ZoomButtons
- zoomChange: (required) a function that accepts a zoom number and carried out the required zoom action.
- zoomStep: (optional) the increment to change the zoom amount by per second (plus or minus). (default: 1)
- zoomStart: (optional) the starting zoom. (default: 1)
- minZoom: (optional) the minimum amount of zoom (default: 0.1)
- maxZoom: (optional) the maximum amount of zoom (default: 5)
- className: (optional) a CSS class to apply to the buttons.

### PDFPage
- width: (required) the width of the page in px.
- height: (required) the height of the page in px.
- pageNum: (required) the page number represented by the component.
- imageSrc: (required) a data URL or image location to be displayed.
- type: (optional) one of "place" or "canvas" for placeholder or image canvas.
- children: (optional) child nodes to display *over the top of* the page (e.g. annotation layer - use styling to position correctly)

### PlaceholderPage
- width: (required) the width of the page in px.
- height: (required) the height of the page in px.
- type: (optional) one of "place" or "canvas" for placeholder or image canvas.
- loadingImage: (optional) an image src string to display in the centre of the loading page (png, jpeg, gif etc);
- spin: (optional) a boolean whether to spin the image (default: false)

### usePDF
- source: (required) a PDFJS source object (see below)
- loadingImage: (optional) an image that will be spun in the middle of loading pages (default: Font Awesome Spinner).
- spinLoadingImage: (optional) Whether to spin the loading image (default: false)
- enableAnnotations: (optional) whether to create an annotations layer. (default: true)

## usePDF return
- pages: a fragment of Placeholder pages or PDFPages (as images) as div & img elements
- changeZoom: call this function to zoom in on the pdf and recreate the images. (scale: number) => void
- changeZoomStart: Call this function when zooming first starts. (scale: number) => void
- changeZoomEnd: call this function when zooming ends. () => void
- renderCurrentPage: Render the page currently in view (and the next page). If the page is already rendered nothing happens unless 'force' is true. (force: boolean) => void

## PDF.js source object
You can find details of the options available on the source object <a href="https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib.html#~DocumentInitParameters" target="_blank">here</a>.
