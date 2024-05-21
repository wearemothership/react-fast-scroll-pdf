import React from "react";
import { IPDFPage } from "../types/fastScrollPDF";

const PDFPage = ({
	width, height, pageNum, imageSrc, children, type = "canvas"
}: IPDFPage): JSX.Element => (
	<div data-type={type} id={`page${pageNum}`} style={{ width: `${width}px`, height: `${height}px` }}>
		<img src={imageSrc} style={{ width: "100%", height: "100%" }} alt={`Page ${pageNum}`} />
		{ children }
	</div>
);

export default PDFPage;
