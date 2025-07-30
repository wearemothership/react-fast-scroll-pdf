import {
	useRef, useEffect, useState, useCallback
} from "react";
import _ from "lodash";
import ZoomButtons from "./ZoomButtons";
import PDFDocument from "./PDFDocument";
import usePDF from "../hook/usePDF";
import styles from "./styles/FastScrollPDF.module.css";
import type { IFastScrollPDF } from "../types/fastScrollPDF";

const FastScrollPDF = ({
	source, loadingImage, enableAnnotations = true, showFitPage = false,
	className, spinLoadingImage = false, hideZoom = false
}: IFastScrollPDF) => {
	const [zoom, setZoom] = useState(1);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const viewerRef = useRef<HTMLDivElement>(null);
	const {
		pages, changeZoomStart, changeZoomEnd, renderCurrentPage, viewportWidth
	} = usePDF({
		source,
		loadingImage,
		enableAnnotations,
		spinLoadingImage,
		scrollContainer: scrollContainerRef.current,
		viewer: viewerRef.current
	});
	const scrollDocument = _.debounce(() => renderCurrentPage(), 100);

	const doZoom = useCallback((newZoom: number) => {
		setZoom(newZoom);
		changeZoomStart(newZoom);
	}, [changeZoomStart]);

	const fitPage = useCallback(() => {
		if (viewportWidth && scrollContainerRef.current) {
			const initial = viewportWidth / zoom;
			const scale = (scrollContainerRef.current.offsetWidth / initial) * 0.95;
			doZoom(scale);
			changeZoomEnd();
			return scale;
		}
		return undefined;
	}, [viewportWidth, doZoom, changeZoomEnd, zoom]);

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
						zoomFit={showFitPage ? fitPage : undefined}
					/>
				) }
			<PDFDocument scrollContainerRef={scrollContainerRef} viewerRef={viewerRef} pages={pages} rowGap={`${32 * zoom}px`} />
		</div>
	);
};

export default FastScrollPDF;
