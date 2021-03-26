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
	source,
	loadingImage,
	enableAnnotations = true,
	spinLoadingImage = false,
	scrollContainer,
	viewer
}: IUsePDF): TUsePDF => {
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
	const docLoaded = useRef(false);
	const oldHeightRef = useRef<number>();

	const renderPage = useCallback((num) => {
		if (!docLoaded.current) {
			return;
		}

		if (pdfDoc) {
			pageRendering.current = true;
			pdfDoc.getPage(num).then((page: PDFPageProxy) => {
				const viewport = page.getViewport({ scale: scaleRef.current * 0.5 });
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
									imageSrc={pageCanvasRef.current.toDataURL("image/png")}
									key={`page${num}`}
								>
									{ enableAnnotations ? <div /> : null}
								</PDFPage>
							);
							return newPages;
						});
					})
					.catch((e) => {
						if (e.name !== "RenderingCancelledException") {
							console.error(`Render Page: ${e}`);
						}
					})
					.finally(() => {
						pageRendering.current = false;
						page.cleanup();
						if (renderQueue.current.length > 0) {
							// New page rendering is pending
							const no = renderQueue.current.shift();
							renderPage(no);
						}
					});
			});
		}
	}, [pdfDoc, linkService, enableAnnotations]);

	const queueRenderPage = useCallback((num: number, jumpQueue = false) => {
		if (pageRendering.current) {
			if (jumpQueue) {
				const ind = renderQueue.current.indexOf(num);
				if (ind >= 0) {
					renderQueue.current.splice(ind, 1);
				}
				renderQueue.current.unshift(num);
			}
			else if (!renderQueue.current.includes(num)) {
				renderQueue.current.push(num);
			}
		}
		else {
			renderPage(num);
		}
	}, [renderPage]);

	const getCurrentPage = useCallback(() => {
		let currPage = 1;
		if (viewer && scrollContainer) {
			const { children } = viewer ?? {};
			for (let i = 0; i < children.length; i += 1) {
				if (children[i].offsetTop <= scrollContainer.scrollTop + 33) {
					currPage = i + 1;
				}
			}
		}

		return currPage;
	}, [scrollContainer, viewer]);

	const isPageRendered = useCallback((pageNo: number) => !!pages[pageNo]?.props.imageSrc, [pages]);

	const changeZoomStart = useCallback((scale: number) => {
		scaleRef.current = scale;
		renderQueue.current.length = 0;
		const oldTopPos = scrollContainer?.scrollTop / scrollContainer?.scrollHeight;
		if (!oldHeightRef.current) {
			oldHeightRef.current = viewportRef.current?.height ?? 300;
		}
		pdfDoc?.getPage(1).then((page) => {
			viewportRef.current = page.getViewport({ scale });
			const { width, height } = viewportRef.current;
			page.cleanup();
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
						<PlaceholderPage
							key={key}
							width={width}
							height={height}
							loadingImage={loadingImage}
							spin={spinLoadingImage}
						/>
					);
				});
				return newPages;
			});

			if (scrollContainer) {
				const scroller = scrollContainer;
				scroller.scrollTop = scrollContainer.scrollHeight * oldTopPos;
			}
		})
			.catch((e) => console.error(`Change Zoom ${e}`));
	}, [scrollContainer,
		pdfDoc,
		loadingImage,
		spinLoadingImage,
	]);

	const changeZoomEnd = useCallback(() => {
		if (pdfDoc) {
			const ratio = (viewportRef.current?.height ?? 400) / (oldHeightRef.current ?? 600);
			oldHeightRef.current = undefined;
			if (ratio > 1.2) {
				const currPage = getCurrentPage();
				queueRenderPage(currPage);
				if (currPage + 1 < pdfDoc.numPages) {
					queueRenderPage(currPage + 1);
				}
				for (let i = 1; i <= pdfDoc.numPages ?? 0; i += 1) {
					if (i !== currPage && i !== currPage + 1) {
						queueRenderPage(i);
					}
				}
			}
			else {
				for (let i = 1; i <= pdfDoc.numPages; i += 1) {
					if (!pages[i]?.props.imageSrc) {
						queueRenderPage(i);
					}
				}
			}
		}
	}, [getCurrentPage, pages, pdfDoc, queueRenderPage]);

	const changeZoom = useCallback((scale: number) => {
		changeZoomStart(scale);
		changeZoomEnd();
	}, [changeZoomEnd, changeZoomStart]);

	const renderCurrentPage = useCallback((force = false) => {
		const currPage = getCurrentPage();
		if (!isPageRendered(currPage) || force) {
			queueRenderPage(currPage + 1, true);
			queueRenderPage(currPage, true);
		}
	}, [getCurrentPage, isPageRendered, queueRenderPage]);

	useEffect(() => {
		if ((source.url || source.data || source.range) && !_.isEqual(source, prevSource.current)) {
			pdfDoc?.cleanup();
			pdfDoc?.destroy();
			docLoaded.current = false;
			renderQueue.current.length = 0;
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
							docLoaded.current = true;
							setPdfDoc(pdfDocument);
						});
					});
			});
		}
	}, [source, pdfDoc]);

	useEffect(() => {
		if (pdfDoc && docLoaded.current) {
			pdfDoc.getPage(1).then((page) => {
				viewportRef.current = page.getViewport({ scale: scaleRef.current });
				page.cleanup();
				setPages((oldPages) => {
					const { width, height } = viewportRef.current ?? { width: 100, height: 100 };
					const { numPages } = pdfDoc;
					const newPages = [...oldPages];
					for (let i = 1; i <= numPages; i += 1) {
						newPages[i] = (
							<PlaceholderPage
								key={`page${i}`}
								width={width}
								height={height}
								loadingImage={loadingImage}
								spin={spinLoadingImage}
							/>
						);
					}
					return newPages;
				});

				for (let i = 1; i <= pdfDoc.numPages; i += 1) {
					queueRenderPage(i);
				}
			})
				.catch((e) => console.error(`UseEffect (pdfDoc, queueRenderPage, loadingImage) ${e}`));
		}
	}, [pdfDoc, queueRenderPage, loadingImage, spinLoadingImage]);

	useEffect(() => () => {
		docLoaded.current = false;
		pdfDoc?.cleanup();
		pdfDoc?.destroy();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return useMemo(() => ({
		renderCurrentPage,
		changeZoom,
		changeZoomStart,
		changeZoomEnd,
		pages
	}), [changeZoom, changeZoomEnd, changeZoomStart, pages, renderCurrentPage]);
};

export default usePDF;
