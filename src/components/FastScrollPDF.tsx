import React, { useRef, useEffect } from "react";
import _ from "lodash";
import ZoomButtons from "./ZoomButtons";
import PDFDocument from "./PDFDocument";
import usePDF from "../hook/usePDF";
import styles from "./styles/FastScrollPDF.module.css";

const FastScrollPDF = ({
	source, loadingImage, quality, enableAnnotations, className, spinLoadingImage
}: IFastScrollPDF): JSX.Element => {
	const scrollContainerRef = useRef<HTMLDivElement>();
	const viewerRef = useRef<HTMLDivElement>();
	const { pages, changeZoom, renderCurrentPage } = usePDF({
		source,
		loadingImage,
		quality,
		enableAnnotations,
		spinLoadingImage,
		scrollContainer: scrollContainerRef.current,
		viewer: viewerRef.current
	});

	const zoomChange = (newZoom: number) => {
		changeZoom({ scale: newZoom });
	};

	const scrollDocument = _.debounce(() => renderCurrentPage(), 500, { maxWait: 500 });

	useEffect(() => {
		const oldRef = scrollContainerRef.current;
		scrollContainerRef.current?.addEventListener("scroll", scrollDocument);

		return () => oldRef?.removeEventListener("scroll", scrollDocument);
	}, [scrollDocument]);

	return (
		<div className={[className, styles.fastScrollPDF].join(" ")}>
			<ZoomButtons zoomChange={zoomChange} />
			<PDFDocument scrollContainerRef={scrollContainerRef} viewerRef={viewerRef} pages={pages} />
		</div>
	);
};

export default FastScrollPDF;
