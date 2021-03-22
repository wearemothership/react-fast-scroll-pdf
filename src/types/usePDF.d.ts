type TDivType = "place" | "canvas"

interface IPage {
	width: number,
	height: number,
	type?: TDivType
}

interface IPlaceholderPage extends IPage {
	loadingImage?: IconDefinition | string
}

interface IPDFPage extends IPlaceholderPage {
	pageNum: number,
	imageSrc: string,
	children: ReactNode
}

interface IUsePDF {
	source: DocumentInitParameters,
	loadingImage?: IconDefinition | string,
	quality?: number,
	enableAnnotations?: boolean
}

interface IPDFDocument {
	source: DocumentInitParameters,
	loadingImage?: IconDefinition | string,
	quality?: number,
	enableAnnotations: boolean,
	width: string,
	height: string,
	className: string
	changeZoom: ({ scale, viewer, scrollContainer }) => void
}

type TPage = IPlaceholderPage | IPDFPage

interface IPDFJSLib {
	AnnotationLayer: AnnotationLayer,
	GlobalWorkerOptions: GlobalWorkerOptions,
	getDocument: getDocument
}
