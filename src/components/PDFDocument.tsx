import styles from "./styles/PDFDocument.module.css";
import type { IPDFDocument } from "../types/fastScrollPDF";

const PDFDocument = ({
	scrollContainerRef, viewerRef, pages, className, rowGap
}: IPDFDocument) => (
	<div id="scrollContainer" ref={scrollContainerRef} className={[className, styles.pdfDocument].join(" ")}>
		<div id="viewer" ref={viewerRef} className={styles.viewer} style={{ rowGap: rowGap || "16px" }}>
			{pages}
		</div>
	</div>
);

export default PDFDocument;
