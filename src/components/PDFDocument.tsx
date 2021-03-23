import React from "react";
import styles from "./styles/PDFDocument.module.css";

const PDFDocument = ({
	scrollContainerRef, viewerRef, pages, className
}: IPDFDocument): JSX.Element => (
	<div id="scrollContainer" ref={scrollContainerRef} className={[className, styles.pdfDocument].join(" ")}>
		<div id="viewer" ref={viewerRef} className={styles.viewer}>
			{pages}
		</div>
	</div>
);

export default PDFDocument;
