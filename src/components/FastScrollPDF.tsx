import React, { useRef } from "react";
import ZoomButtons from "./ZoomButtons";
import PDFDocument from "./PDFDocument";
import usePDF from "../hook/usePDF";
import styles from "./styles/FastScrollPDF.module.css";

const FastScrollPDF = ({
	source, loadingImage, quality, enableAnnotations, className, spinLoadingImage
}: IFastScrollPDF): JSX.Element => {
	const scrollContainerRef = useRef();
	const viewerRef = useRef();
	const { pages, changeZoom } = usePDF({
		source,
		loadingImage,
		quality,
		enableAnnotations,
		spinLoadingImage
	});

	const zoomChange = (newZoom: number) => {
		changeZoom({
			scale: newZoom, viewer: viewerRef.current, scrollContainer: scrollContainerRef.current
		});
	};

	return (
		<div className={[className, styles.fastScrollPDF].join(" ")}>
			<ZoomButtons zoomChange={zoomChange} />
			<PDFDocument scrollContainerRef={scrollContainerRef} viewerRef={viewerRef} pages={pages} />
		</div>
	);
};

export default FastScrollPDF;
