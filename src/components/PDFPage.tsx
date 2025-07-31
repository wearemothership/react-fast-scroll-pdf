import type { IPDFPage } from "../types/fastScrollPDF";
import {
	FC
} from "react";

const PDFPage: FC<IPDFPage> = ({
	width, height, pageNum, imageSrc, children, type = "canvas"
}) => (
	<div data-type={type} id={`page${pageNum}`} style={{ width: `${width}px`, height: `${height}px` }}>
		<img src={imageSrc} style={{ width: "100%", height: "100%" }} alt={`Page ${pageNum}`} />
		{ children }
	</div>
);

export default PDFPage;
