/// <reference types="react" />
declare const usePDF: ({ source, loadingImage, quality, enableAnnotations }: IUsePDF) => {
    changeZoom: ({ scale, viewer, scrollContainer }: IChangeZoom) => void;
    pages: JSX.Element[];
};
export { usePDF };
