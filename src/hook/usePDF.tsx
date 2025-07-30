/* eslint-disable @typescript-eslint/ban-ts-comment */
 
// @ts-ignore
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import "pdfjs-dist/legacy/build/pdf.worker.mjs";
// @ts-ignore
import { PDFLinkService } from "pdfjs-dist/legacy/web/pdf_viewer.mjs";
import React, {
	useEffect, useState, useRef, useCallback, useMemo, useLayoutEffect
} from "react";
import _ from "lodash";
import { DocumentInitParameters, PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist/types/src/display/api";
import { PageViewport } from "pdfjs-dist/types/src/display/display_utils";
import { produce } from "immer";
import parse from "html-react-parser";
import PDFPage from "../components/PDFPage";
import PlaceholderPage from "../components/PlaceholderPage";
import type { IUsePDF, TUsePDF } from "../types/fastScrollPDF";

const CMAP_URL = "pdfjs-dist/cmaps/";

const cleanupPage = (
	page: PDFPageProxy,
	attempts = 0,
	maxAttempts = 3
) => new Promise((resolve, reject) => {
	const success = page.cleanup(true);
	if (success) {
		resolve(success);
	}
	else if (attempts <= maxAttempts) {
		setTimeout(() => {
			resolve(cleanupPage(page, attempts + 1));
		}, 100 * attempts);
	}
	else {
		reject(new Error("Couldn't clean up the page"));
	}
});

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
	const prevSource = useRef<DocumentInitParameters>();
	const viewportRef = useRef<PageViewport>();
	const renderQueue = useRef<number[]>([]);
	const pageCanvasRef = useRef(document.createElement("canvas"));
	const linkService = useMemo(() => new PDFLinkService(), []);
	const pageRendering = useRef(false);
	const docLoaded = useRef(false);
	const oldHeightRef = useRef<number>();

	const processQueue = useMemo(() => _.debounce(async () => {
		const renderPage = async (num: number) => {
			if (!docLoaded.current) {
				return;
			}

			if (pdfDoc) {
				try {
					pageRendering.current = true;
					const page = await pdfDoc.getPage(num);
					// kill the render early if Q cleared
					if (renderQueue.current.length === 0) {
						pageRendering.current = false;
						return;
					}
					const viewport = page.getViewport({ scale: scaleRef.current });
					pageCanvasRef.current.height = viewport.height * window.devicePixelRatio;
					pageCanvasRef.current.width = viewport.width * window.devicePixelRatio;
					pageCanvasRef.current.style.width = `${viewport.width}px`;
					pageCanvasRef.current.style.height = `${viewport.height}px`;
					const ctx = pageCanvasRef.current.getContext("2d") as CanvasRenderingContext2D;
					ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

					// Render PDF page into canvas context
					const renderContext = {
						canvasContext: ctx,
						viewport,
						enableWebGL: true,
						intent: "any",
						annotationMode: pdfjsLib.AnnotationMode.ENABLE
					};

					try {
						const renderTask = page.render(renderContext);

						await renderTask.promise;

						if (renderQueue.current.length === 0) {
							return;
						}
						const annotationData = await page.getAnnotations();
						// kill the render early
						if (renderQueue.current.length === 0) {
							return;
						}
						let annotationDiv: HTMLDivElement;
						if (enableAnnotations) {
							annotationDiv = document.createElement("div");
							annotationDiv.id = `annot${num}`;
							annotationDiv.className = "annotationLayer";

							const layer = new pdfjsLib.AnnotationLayer({
								div: annotationDiv,
								accessibilityManager: null,
								annotationCanvasMap: null,
								annotationEditorUIManager: null,
								page,
								viewport
							});

							layer.render({
								viewport: viewport.clone({ dontFlip: true }),
								div: annotationDiv,
								page,
								linkService,
								annotations: annotationData,
								renderForms: false
							});

							annotationDiv.style.top = pageCanvasRef.current.style.top;
							annotationDiv.style.left = pageCanvasRef.current.style.left;
							annotationDiv.style.width = "100%";
							annotationDiv.style.height = "100%";
						}

						setPages((oldPages) => produce(oldPages, (draft) => {
							const { width, height } = viewportRef.current ?? { width: 100, height: 100 };
							draft[num] = (
								<PDFPage
									pageNum={num}
									width={width}
									height={height}
									imageSrc={pageCanvasRef.current.toDataURL("image/png")}
									key={`page${num}`}
								>
									{ enableAnnotations ? parse(annotationDiv.outerHTML) : null }
								</PDFPage>
							);
						}));
					}
					catch (e) {
						console.error(e);
						if ((e as Error).name !== "RenderingCancelledException") {
							console.error(`Render Page: ${e}`);
						}
					}
					finally {
						await cleanupPage(page);
						renderQueue.current = renderQueue.current.filter((p) => p !== num);
						pageRendering.current = false;
						processQueue();
					}
				}
				catch (e) {
					console.error(e);
					pageRendering.current = false;
				}
			}
		};

		const page = renderQueue.current[0];
		if (page && !pageRendering.current) {
			await renderPage(page);
		}
	}, 100), [pdfDoc, enableAnnotations, linkService]);

	const queueRenderPage = useCallback((num: number, jumpQueue = false) => {
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
		processQueue();
	}, [processQueue]);

	const getCurrentPage = useCallback(() => {
		let currPage = 1;
		if (viewer && scrollContainer) {
			const { children } = viewer ?? {};
			for (let i = 0; i < children.length; i += 1) {
				const child = children[i];
				if (child instanceof HTMLElement && child.offsetTop <= scrollContainer.scrollTop + 33) {
					currPage = i + 1;
				}
			}
		}

		return currPage;
	}, [scrollContainer, viewer]);

	const pendingScrollRef = useRef<{ centerRatio: number } | null>(null);

	const changeZoomStart = useCallback((scale: number) => {
		processQueue.cancel();
		scaleRef.current = scale;
		renderQueue.current.length = 0;

		// Calculate center ratio for scroll restoration
		if (scrollContainer) {
			const oldScrollTop = scrollContainer.scrollTop;
			const oldClientHeight = scrollContainer.clientHeight;
			const oldScrollHeight = scrollContainer.scrollHeight;
			const viewportCenter = oldScrollTop + (oldClientHeight / 2);
			const centerRatio = oldScrollHeight > 0 ? viewportCenter / oldScrollHeight : 0;
			pendingScrollRef.current = { centerRatio };
		}
		else {
			pendingScrollRef.current = null;
		}

		if (!oldHeightRef.current) {
			oldHeightRef.current = viewportRef.current?.height ?? 300;
		}
		pdfDoc?.getPage(1).then((page: PDFPageProxy) => {
			viewportRef.current = page.getViewport({ scale });
			const { width, height } = viewportRef.current;
			page.cleanup();
			setPages((oldPages) => oldPages.map((pg, index) => {
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
			}));
		})
			.catch((e: Error) => console.error(`Change Zoom ${e}`));
	}, [processQueue, scrollContainer, pdfDoc, loadingImage, spinLoadingImage]);

	useLayoutEffect(() => {
		if (pendingScrollRef.current && scrollContainer) {
			const { centerRatio } = pendingScrollRef.current;
			const newScrollHeight = scrollContainer.scrollHeight;
			const newCenterPoint = newScrollHeight * centerRatio;
			const newScrollTop = Math.max(0, newCenterPoint - (scrollContainer.clientHeight / 2));
			scrollContainer.scrollTo({ top: newScrollTop });
			pendingScrollRef.current = null;
		}
	}, [pages, scrollContainer]);

	const changeZoomEnd = useCallback(() => {
		if (pdfDoc) {
			oldHeightRef.current = undefined;
			const currPage = getCurrentPage();
			queueRenderPage(currPage, true);
			if (currPage + 1 < pdfDoc.numPages) {
				queueRenderPage(currPage + 1, true);
			}
			for (let i = 1; i <= pdfDoc.numPages; i += 1) {
				if (i !== currPage && i !== currPage + 1) {
					queueRenderPage(i);
				}
			}
		}
	}, [getCurrentPage, pdfDoc, queueRenderPage]);

	const changeZoom = useCallback((scale: number) => {
		changeZoomStart(scale);
		changeZoomEnd();
	}, [changeZoomEnd, changeZoomStart]);

	const renderCurrentPage = useCallback((force = false) => {
		const currPage = getCurrentPage();
		const nextPage = Math.min(currPage + 1, pdfDoc?.numPages || 1);
		const isPageRendered = (pageNo: number) => !!pages[pageNo]?.props.imageSrc;
		if (force || !isPageRendered(nextPage)) {
			queueRenderPage(nextPage, true);
		}
		if (force || !isPageRendered(currPage) || force) {
			queueRenderPage(currPage, true);
		}
	}, [getCurrentPage, queueRenderPage, pdfDoc, pages]);

	useEffect(() => {
		if ((source.url || source.data || source.range) && !_.isEqual(source, prevSource.current)) {
			pdfDoc?.cleanup();
			pdfDoc?.destroy();
			docLoaded.current = false;
			renderQueue.current.length = 0;
			prevSource.current = source;
			setPages([]);
			pdfjsLib.GlobalWorkerOptions.workerSrc = "pdfjs-dist/build/pdf.worker.mjs";

			const loadingTask = pdfjsLib.getDocument?.({
				cMapUrl: CMAP_URL,
				cMapPacked: true,
				...source
			});
			loadingTask?.promise.then((pdfDocument: PDFDocumentProxy) => {
				docLoaded.current = true;
				setPdfDoc(pdfDocument);
			})
				.catch((err: Error) => {
					console.error("Error loading PDF", err);
					setPages([
						<div style={{ width: "300px", height: "100px" }} data-type="error">
							{`Error loading PDF: ${err}`}
						</div>
					]);
				});
		}
	}, [source, pdfDoc]);

	useEffect(() => {
		if (pdfDoc && docLoaded.current) {
			pdfDoc.getPage(1).then((page: PDFPageProxy) => {
				viewportRef.current = page.getViewport({ scale: scaleRef.current });
				page.cleanup();
				setPages((oldPages) => produce(oldPages, (draft) => {
					const { width, height } = viewportRef.current ?? { width: 100, height: 100 };
					const { numPages } = pdfDoc;
					for (let i = 1; i <= numPages; i += 1) {
						draft[i] = (
							<PlaceholderPage
								key={`page${i}`}
								width={width}
								height={height}
								loadingImage={loadingImage}
								spin={spinLoadingImage}
							/>
						);
					}
				}));

				for (let i = 1; i <= pdfDoc.numPages; i += 1) {
					queueRenderPage(i);
				}
			})
				.catch((e: Error) => console.error(`UseEffect (pdfDoc, queueRenderPage, loadingImage) ${e}`));
		}
	}, [pdfDoc, queueRenderPage, loadingImage, spinLoadingImage]);

	const docRef = useRef(pdfDoc);
	useEffect(() => {
		docRef.current = pdfDoc;
	}, [pdfDoc]);

	useEffect(() => () => {
		renderQueue.current.length = 0;
		docLoaded.current = false;
		docRef.current?.cleanup();
		docRef.current?.destroy();
	}, []);

	return useMemo(() => ({
		renderCurrentPage,
		changeZoom,
		changeZoomStart,
		changeZoomEnd,
		pages,
		viewportWidth: viewportRef.current?.width,
		viewportHeight: viewportRef.current?.height
	}), [changeZoom, changeZoomEnd, changeZoomStart, pages, renderCurrentPage]);
};

export default usePDF;
