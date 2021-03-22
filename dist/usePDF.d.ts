/// <reference types="react" />
export declare const usePDF: ({ source, loadingImage, quality, enableAnnotations }: IUsePDF) => {
    changeZoom: ({ scale, viewer, scrollContainer }: any) => void;
    pages: JSX.Element[];
};
export declare const PDFDocument: ({ source, loadingImage, quality, enableAnnotations, changeZoom, width, height, className }: IPDFDocument) => JSX.Element;
