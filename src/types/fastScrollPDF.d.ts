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
	quality?: number,
	enableAnnotations?: boolean
}

interface IChangeScale {
	scale: number,
	scrollContainer?: ReactNode,
	viewer?: ReactNode,
}

type TUsePDF = {
	changeZoom: ({ scale, viewer, scrollContainer }: IChangeScale) => void,
	pages: (JSX.Element | undefined)[]
}

type TPage = IPlaceholderPage | IPDFPage

interface IPDFJSLib {
	AnnotationLayer: AnnotationLayer,
	GlobalWorkerOptions: GlobalWorkerOptions,
	getDocument: getDocument
}

interface IChangeZoom {
	scale: number,
	viewer?: ReactNode,
	scrollContainer?: ReactNode
}

interface IZoomButtons {
	zoomChange: (zoom: number) => void,
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
	className?: string
}

declare module "*.gif"
