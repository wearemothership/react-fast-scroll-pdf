import React, { useRef, useEffect, useState } from "react";
import _ from "lodash";
import ZoomButtons from "./ZoomButtons";
import PDFDocument from "./PDFDocument";
import usePDF from "../hook/usePDF";
import styles from "./styles/FastScrollPDF.module.css";
import { IFastScrollPDF } from "../types/fastScrollPDF";

const FastScrollPDF = ({
	source, loadingImage, enableAnnotations = true, className, spinLoadingImage = false, hideZoom = false
}: IFastScrollPDF): JSX.Element => {
	const [zoom, setZoom] = useState(1);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const viewerRef = useRef<HTMLDivElement>(null);
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
	const scrollDocument = _.debounce(() => renderCurrentPage(), 100);

	const doZoom = (newZoom: number) => {
		setZoom(newZoom);
		changeZoomStart(newZoom);
	};

	useEffect(() => {
		const oldRef = scrollContainerRef.current;
		scrollContainerRef.current?.addEventListener("scroll", scrollDocument);

		return () => oldRef?.removeEventListener("scroll", scrollDocument);
	}, [scrollDocument]);

	return (
		<div className={[className, styles.fastScrollPDF].join(" ")}>
			{ hideZoom
				? null
				: (
					<ZoomButtons
						zoomChangeStart={doZoom}
						zoomChangeEnd={changeZoomEnd}
					/>
				) }
			<PDFDocument scrollContainerRef={scrollContainerRef} viewerRef={viewerRef} pages={pages} rowGap={`${32 * zoom}px`} />
		</div>
	);
};

export default FastScrollPDF;
