/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable import/no-unresolved */
// @ts-ignore
import { PDFLinkService } from "pdfjs-dist/es5/web/pdf_viewer";
import React, {
	useEffect, useState, useRef, useCallback, useMemo
} from "react";
import _ from "lodash";
import { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist/types/display/api";
import { PageViewport } from "pdfjs-dist/types/display/display_utils";
import PDFPage from "../components/PDFPage";
import PlaceholderPage from "../components/PlaceholderPage";

const CMAP_URL = "pdfjs-dist/cmaps/";

const usePDF = ({
	source, loadingImage, quality = 80, enableAnnotations = true
}: IUsePDF): TUsePDF => {
	if (quality < 1 || quality > 100) {
		throw new Error("The 'quality' prop must be between 1 and 100");
	}
	const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy>();
	const [pages, setPages] = useState<(JSX.Element | undefined)[]>([]);
	const scaleRef = useRef(1);
	const prevSource = useRef();
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
								key={`page${num}`}
							>
								{ enableAnnotations ? <div /> : null}
							</PDFPage>
						);
						return newPages;
					});

					pageRendering.current = false;
					page.cleanup();
					if (renderQueue.current.length > 0) {
						// New page rendering is pending
						const no = renderQueue.current.shift();
						renderPage(no);
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

	const changeZoom = useCallback(({ scale, viewer, scrollContainer }: IChangeZoom) => {
		renderQueue.current.length = 0;
		scaleRef.current = scale;
		const oldHeight = viewportRef.current?.height ?? 1;
		pdfDoc?.getPage(1).then((page) => {
			viewportRef.current = page.getViewport({ scale });
			const { width, height } = viewportRef.current;
			page.cleanup();
			let currPage = 1;
			if (viewer && scrollContainer) {
				const { children } = viewer ?? {};
				for (let i = 0; i < children.length; i += 1) {
					if (children[i].offsetTop <= scrollContainer.scrollTop + 33) {
						currPage = i + 1;
					}
				}
			}
			setPages((oldPages) => {
				const newPages = oldPages.map((pg, index) => {
					if (!pg) {
						return undefined;
					}
					const { imageSrc, children } = pg.props;
					const key = `page${index}`;
					if (imageSrc) {
						return (
							<PDFPage key={key} pageNum={index} width={width} height={height} imageSrc={imageSrc}>
								{ children }
							</PDFPage>
						);
					}
					return (
						<PlaceholderPage key={key} width={width} height={height} loadingImage={loadingImage} />
					);
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

			if (scrollContainer) {
				const scroller = scrollContainer;
				const ratio = viewportRef.current.height / oldHeight;
				scroller.scrollTop *= ratio;
			}
		});
	}, [pdfDoc, queueRenderPage, loadingImage]);

	useEffect(() => {
		if (pdfDoc) {
			pdfDoc?.getPage(1).then((page) => {
				viewportRef.current = page.getViewport({ scale: scaleRef.current });
				page.cleanup();
				setPages((oldPages) => {
					const { width, height } = viewportRef.current ?? { width: 100, height: 100 };
					const { numPages } = pdfDoc;
					const newPages = [...oldPages];
					for (let i = 1; i <= numPages; i += 1) {
						newPages[i] = <PlaceholderPage key={`page${i}`} width={width} height={height} loadingImage={loadingImage} />;
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
		if ((source.url || source.data || source.range) && !_.isEqual(source, prevSource.current)) {
			pdfDoc?.cleanup();
			pdfDoc?.destroy();
			prevSource.current = source;
			setPages([]);
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
							setPdfDoc(pdfDocument);
						});
					});
			});
		}
	}, [source, pdfDoc]);

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

export default usePDF;
