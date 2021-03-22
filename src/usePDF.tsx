// @ts-ignore
import { PDFLinkService } from "pdfjs-dist/es5/web/pdf_viewer";
import React, {
	useEffect, useState, useRef, useCallback, useMemo, Fragment
} from "react";
import styles from "./styles/usePDF.module.css";
import parse from "react-html-parser";
import { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist/types/display/api";
import { PageViewport } from "pdfjs-dist/types/display/display_utils";
import { faSpinner } from "@fortawesome/free-solid-svg-icons"

const CMAP_URL = "pdfjs-dist/cmaps/";

const PlaceholderPage = ({ width, height, type = "place", loadingImage = faSpinner }: IPlaceholderPage): JSX.Element => (
	<div style={{ width: `${width}px`, height: `${height}px` }} data-type={type}>
		<img src={loadingImage} className={styles.spinner} alt="Loading..." />
	</div>
);

const PDFPage = ({
	width, height, pageNum, imageSrc, children, type = "canvas"
}: IPDFPage): JSX.Element => (
	<div data-type={type} id={`page${pageNum}`} style={{ width: `${width}px`, height: `${height}px` }}>
		<img src={imageSrc} style={{ width: "100%", height: "100%" }} alt={`Page ${pageNum}`} />
		{ children }
	</div>
);

export const usePDF = ({ source, loadingImage, quality = 80, enableAnnotations = true }: IUsePDF) => {
	const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy>();
	const [pages, setPages] = useState<JSX.Element[]>([]);
	const scaleRef = useRef(1);
	const viewportRef = useRef<PageViewport>();
	const renderQueue = useRef<number[]>([]);
	const pdfjsLib = useRef<Partial<IPDFJSLib>>({});
	const pageCanvasRef = useRef(document.createElement("canvas"));
	const linkService = useMemo(() => new PDFLinkService(), []);
	const pageRendering = useRef(false);

	const renderPage = useCallback((num) => {
		pageRendering.current = true;
		// Using promise to fetch the page
		pdfDoc?.getPage(num).then((page: PDFPageProxy) => {
			const viewport = page.getViewport({ scale: scaleRef.current });
			pageCanvasRef.current.height = viewport.height;
			pageCanvasRef.current.width = viewport.width;
			const ctx = pageCanvasRef.current.getContext("2d") as CanvasRenderingContext2D;

			// Render PDF page into canvas context
			const renderContext = {
				canvasContext: ctx,
				viewport,
				enableWebGL: true
			};

			const loadingTask = page.render(renderContext);

			loadingTask.promise.then(() => page.getAnnotations())
				.then((annotationData) => {
					let annotationDiv: HTMLDivElement;
					if (enableAnnotations) {
						annotationDiv = document.createElement("div");
						annotationDiv.id = `annot${num}`;
						annotationDiv.className = "annotationLayer";

						pdfjsLib.current.AnnotationLayer.render({
							viewport: viewport.clone({ dontFlip: true }),
							div: annotationDiv,
							annotations: annotationData,
							page,
							linkService
						});
					}

					setPages((oldPages) => {
						const newPages = [...oldPages];
						const { width, height } = viewportRef.current ?? { width: 100, height: 100 };
						newPages[num] = (
							<PDFPage
								pageNum={num}
								width={width}
								height={height}
								imageSrc={pageCanvasRef.current.toDataURL("image/jpeg", quality / 100)}
							>
								{ enableAnnotations ? parse(annotationDiv.outerHTML) : null}
							</PDFPage>
						);
						return newPages;
					});

					pageRendering.current = false;
					page.cleanup();
					if (renderQueue.current.length > 0) {
						// New page rendering is pending
						const no = renderQueue.current.shift();
						setTimeout(() => renderPage(no), 0);
					}
				})
				.catch((e) => {
					console.error(e);
				});
		});
	}, [pdfDoc, linkService, quality, enableAnnotations]);

	const queueRenderPage = useCallback((num: number) => {
		if (pageRendering.current) {
			if (!renderQueue.current.includes(num)) {
				renderQueue.current.push(num);
			}
		}
		else {
			renderPage(num);
		}
	}, [renderPage]);

	const changeZoom = useCallback(({ scale, viewer, scrollContainer }) => {
		const scroller = scrollContainer;
		renderQueue.current.length = 0;
		const { children } = viewer;
		scaleRef.current = scale;
		const oldHeight = viewportRef.current?.height ?? 1;
		pdfDoc?.getPage(1).then((page) => {
			viewportRef.current = page.getViewport({ scale });
			const { width, height } = viewportRef.current;
			page.cleanup();
			let currPage = 1;
			for (let i = 0; i < children.length; i += 1) {
				if (children[i].offsetTop <= scroller.scrollTop + 33) {
					currPage = i + 1;
				}
			}
			setPages((oldPages) => {
				const newPages = oldPages.map((pg, index) => {
					if (!pg) {
						return <Fragment></Fragment>;
					}
					const { imageSrc, children: PDFChildren } = pg.props;
					if (imageSrc) {
						return (
							<PDFPage pageNum={index} width={width} height={height} imageSrc={imageSrc}>
								{ PDFChildren }
							</PDFPage>
						);
					}
					return <PlaceholderPage width={width} height={height} loadingImage={loadingImage} />;
				});
				return newPages;
			});

			queueRenderPage(currPage);
			if (currPage + 1 < pdfDoc.numPages) {
				queueRenderPage(currPage + 1);
			}
			for (let i = 1; i <= pdfDoc.numPages; i += 1) {
				if (i !== currPage && i !== currPage + 1) {
					queueRenderPage(i);
				}
			}
			const ratio = viewportRef.current.height / oldHeight;
			scroller.scrollTop *= ratio;
		});
	}, [pdfDoc, queueRenderPage, loadingImage]);

	useEffect(() => {
		if (pdfDoc) {
			pdfDoc.getPage(1).then((page) => {
				viewportRef.current = page.getViewport({ scale: scaleRef.current });
				page.cleanup();
				setPages((oldPages) => {
					const { width, height } = viewportRef.current ?? { width: 100, height: 100 };
					const { numPages } = pdfDoc;
					const newPages = [...oldPages];
					for (let i = 1; i <= numPages; i += 1) {
						newPages[i] = <PlaceholderPage width={width} height={height} loadingImage={loadingImage} />;
					}
					return newPages;
				});

				for (let i = 1; i <= pdfDoc.numPages; i += 1) {
					queueRenderPage(i);
				}
			});
		}
	}, [pdfDoc, queueRenderPage, loadingImage]);

	useEffect(() => {
		// @ts-ignore
		import("pdfjs-dist/es5/build/pdf").then((lib) => {
			pdfjsLib.current = lib as IPDFJSLib;
			// @ts-ignore
			import("pdfjs-dist/es5/build/pdf.worker.entry")
				.then((pdfjsWorker) => {
					pdfjsLib.current.GlobalWorkerOptions.workerSrc = pdfjsWorker;

					const loadingTask = pdfjsLib.current?.getDocument({
						cMapUrl: CMAP_URL,
						cMapPacked: true,
						...source
					});
					loadingTask.promise.then((pdfDocument: PDFDocumentProxy) => {
						// Document loaded, specifying document for the viewer and
						// the (optional) linkService.
						setPdfDoc(pdfDocument);
					});
				});
		});
	}, [source]);

	useEffect(() => () => {
		pdfDoc?.cleanup();
		pdfDoc?.destroy();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return {
		changeZoom,
		pages
	};
};

export const PDFDocument = ({
	source, loadingImage, quality, enableAnnotations, changeZoom, width = "600px", height = "800px", className
}: IPDFDocument): JSX.Element => {
	const { pages, changeZoom: doChangeZoom } = usePDF({ source, loadingImage, quality, enableAnnotations });
	changeZoom = doChangeZoom

	return (
		<div style={{ width, height }} className={className}>
			{ pages }
		</div>
	)
}
