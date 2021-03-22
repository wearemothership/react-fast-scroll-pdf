# pdf-viewer

# background
I needed a way to very quickly render a complete PDF document but without using a lot of canvas elements (iPads etc limit the amount of canvas memory). This uses a single canvas element 
and uses pdfjs-dist to render each pdf page before converting it to a jpeg image. PDF annotations are then placed on top of the image so that links etc still work.

## install
```bash
npm install --save @mothershipsoft/pdf-viewer
```

## Usage

You can import the default PDFDocument element into React
```jsx
import React, { useRef, useState } from "react"
import usePDF from "@mothershipsoft/pdf-viewer"

const ExampleComponent = (): JSX.Element => {
	const scrollContainerRef = useRef();
	const viewerRef = useRef();
	const [scale, useScale] = useScale();
	const sourceOptions = {
		url: "./example.pdf"
	}
	const { pages, changeZoom } = usePDF({
		source: sourceOptions
	})
	const ZOOM_CHANGE = 0.1;

	const zoomIn = () => {
		const newScale += ZOOM_CHANGE;
		if (newScale > 0) {
			setZoom(newScale);
			changeZoom({ scale: newScale })
		}
	}

	const zoomOut = () => {
		const newScale -= ZOOM_CHANGE;
		if (newScale < 2) {
			setZoom(newScale);
			changeZoom({ scale: newScale })
		}
	}
	
	return (
		<>
			<div id="scrollContainer" ref={scrollContainerRef} style={{ overflow: "scroll", height: "800px" }}>
				<div id="viewer" ref={viewerRef}>
					{pages}
				</div>
			</div>
			<button type="button" onClick={zoomIn}>+</button>
			<button type="button" onClick={zoomOut}>-</button>
			
		</>
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
