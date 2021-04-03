import React, { useRef, useEffect, useMemo } from "react";
import _ from "lodash";
import ZoomButtons from "./ZoomButtons";
import PDFDocument from "./PDFDocument";
import usePDF from "../hook/usePDF";
import styles from "./styles/FastScrollPDF.module.css";

const FastScrollPDF = ({
	source, loadingImage, enableAnnotations, className, spinLoadingImage, hideZoom = false
}: IFastScrollPDF): JSX.Element => {
	const scrollContainerRef = useRef<HTMLDivElement>();
	const viewerRef = useRef<HTMLDivElement>();
	const {
		pages, changeZoomStart, changeZoomEnd, renderCurrentPage
	} = usePDF({
		source,
		loadingImage,
		enableAnnotations,
		spinLoadingImage,
		scrollContainer: scrollContainerRef.current,
		viewer: viewerRef.current
	});

	const scrollDocument = _.debounce(() => renderCurrentPage(), 500, { maxWait: 500 });
	const zoomButtons = useMemo(() => (
		<ZoomButtons
			zoomChangeStart={changeZoomStart}
			zoomChangeEnd={changeZoomEnd}
		/>), [changeZoomStart, changeZoomEnd]);

	useEffect(() => {
		const oldRef = scrollContainerRef.current;
		scrollContainerRef.current?.addEventListener("scroll", scrollDocument);

		return () => oldRef?.removeEventListener("scroll", scrollDocument);
	}, [scrollDocument]);

	return (
		<div className={[className, styles.fastScrollPDF].join(" ")}>
			{ hideZoom
				? null
				: zoomButtons
				}
			<PDFDocument scrollContainerRef={scrollContainerRef} viewerRef={viewerRef} pages={pages} />
		</div>
	);
};

export default FastScrollPDF;
