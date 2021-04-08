type TDivType = "place" | "canvas"

interface IPage {
	width: number,
	height: number,
	type?: TDivType
}

interface IPlaceholderPage extends IPage {
	loadingImage?: IconDefinition | string,
	spin?: boolean
}

interface IPDFPage extends IPage {
	pageNum: number,
	imageSrc: string,
	children?: ReactNode
}

interface IUsePDF {
	source: DocumentInitParameters,
	loadingImage?: string,
	spinLoadingImage?: boolean,
	enableAnnotations?: boolean,
	viewer?: ReactNode,
	scrollContainer?: ReactNode
}

type TUsePDF = {
	renderCurrentPage: (force?: boolean) => void,
	changeZoom: (scale: number) => void,
	changeZoomStart: (scale: number) => void,
	changeZoomEnd: () => void,
	pages: (JSX.Element | undefined)[]
}

type TPage = IPlaceholderPage | IPDFPage

interface IZoomButtons {
	zoomChangeStart: (zoom: number) => void,
	zoomChangeEnd: () => void,
	zoomStep?: number,
	zoomStart?: number,
	minZoom?: number,
	maxZoom?: number,
	className?: string
}

interface IPDFDocument {
	scrollContainerRef?: MutableRefObject<HTMLDivElement>,
	viewerRef?: MutableRefObject<HTMLDivElement>,
	pages: (JSX.Element | undefined)[],
	className?: string
}

interface IFastScrollPDF extends IUsePDF {
	hideZoom?: boolean
	className?: string
}

declare module "*.gif"
