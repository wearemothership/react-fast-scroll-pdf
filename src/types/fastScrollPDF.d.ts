import type { DocumentInitParameters } from "pdfjs-dist/types/src/display/api";
import type { ReactNode, RefObject, ReactElement } from "react";

type TDivType = "place" | "canvas";

interface IPage {
	width: number,
	height: number,
	type?: TDivType
}

interface IPlaceholderPage extends IPage {
	loadingImage?: string,
	spin?: boolean
}

export interface IPDFPage extends IPage {
	pageNum: number,
	imageSrc: string,
	children?: ReactNode
}

export interface IUsePDF {
	source: DocumentInitParameters,
	loadingImage: string,
	spinLoadingImage?: boolean,
	enableAnnotations?: boolean,
	viewer?: HTMLDivElement | null,
	scrollContainer?: HTMLDivElement | null
}

export type TUsePDF = {
	renderCurrentPage: (force?: boolean) => void,
	changeZoom: (scale: number) => void,
	changeZoomStart: (scale: number) => void,
	changeZoomEnd: () => void,
	pages: (ReactElement | undefined)[],
	viewportWidth?: number | undefined,
	viewportHeight?: number | undefined,
};

export type TPage = IPlaceholderPage | IPDFPage;

export interface IZoomButtons {
	zoomChangeStart: (zoom: number) => void,
	zoomChangeEnd: () => void,
	zoomFit?: () => number | undefined,
	zoomStep?: number,
	zoomStart?: number,
	minZoom?: number,
	maxZoom?: number,
	buttonClasses?: string,
	groupClasses?: string,
	selectedClass?: string
	icons?: {
		zoomIn?: ReactNode,
		zoomOut?: ReactNode,
		fitPage?: ReactNode
	}
}

export interface IPDFDocument {
	scrollContainerRef?: RefObject<HTMLDivElement | null>,
	viewerRef?: RefObject<HTMLDivElement | null>,
	pages: (ReactElement | undefined)[],
	className?: string,
	rowGap?: string
}

export interface IFastScrollPDF extends IUsePDF {
	hideZoom?: boolean
	className?: string
	showFitPage?: boolean
}
