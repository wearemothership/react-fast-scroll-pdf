function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

function _interopNamespace(e) {
	if (e && e.__esModule) { return e; } else {
		var n = {};
		if (e) {
			Object.keys(e).forEach(function (k) {
				var d = Object.getOwnPropertyDescriptor(e, k);
				Object.defineProperty(n, k, d.get ? d : {
					enumerable: true,
					get: function () {
						return e[k];
					}
				});
			});
		}
		n['default'] = e;
		return n;
	}
}

var pdf_viewer = require('pdfjs-dist/es5/web/pdf_viewer');
var React = require('react');
var React__default = _interopDefault(React);
var parse = _interopDefault(require('react-html-parser'));
var freeSolidSvgIcons = require('@fortawesome/free-solid-svg-icons');

var styles = {"spinner":"_w5_ib","rotation":"_3BERG"};

var CMAP_URL = "pdfjs-dist/cmaps/";

var PlaceholderPage = function PlaceholderPage(_ref) {
  var width = _ref.width,
      height = _ref.height,
      _ref$type = _ref.type,
      type = _ref$type === void 0 ? "place" : _ref$type,
      _ref$loadingImage = _ref.loadingImage,
      loadingImage = _ref$loadingImage === void 0 ? freeSolidSvgIcons.faSpinner : _ref$loadingImage;
  return React__default.createElement("div", {
    style: {
      width: width + "px",
      height: height + "px"
    },
    "data-type": type
  }, React__default.createElement("img", {
    src: loadingImage,
    className: styles.spinner,
    alt: "Loading..."
  }));
};

var PDFPage = function PDFPage(_ref2) {
  var width = _ref2.width,
      height = _ref2.height,
      pageNum = _ref2.pageNum,
      imageSrc = _ref2.imageSrc,
      children = _ref2.children,
      _ref2$type = _ref2.type,
      type = _ref2$type === void 0 ? "canvas" : _ref2$type;
  return React__default.createElement("div", {
    "data-type": type,
    id: "page" + pageNum,
    style: {
      width: width + "px",
      height: height + "px"
    }
  }, React__default.createElement("img", {
    src: imageSrc,
    style: {
      width: "100%",
      height: "100%"
    },
    alt: "Page " + pageNum
  }), children);
};

var usePDF = function usePDF(_ref3) {
  var source = _ref3.source,
      loadingImage = _ref3.loadingImage,
      _ref3$quality = _ref3.quality,
      quality = _ref3$quality === void 0 ? 80 : _ref3$quality,
      _ref3$enableAnnotatio = _ref3.enableAnnotations,
      enableAnnotations = _ref3$enableAnnotatio === void 0 ? true : _ref3$enableAnnotatio;

  var _useState = React.useState(),
      pdfDoc = _useState[0],
      setPdfDoc = _useState[1];

  var _useState2 = React.useState([]),
      pages = _useState2[0],
      setPages = _useState2[1];

  var scaleRef = React.useRef(1);
  var viewportRef = React.useRef();
  var renderQueue = React.useRef([]);
  var pdfjsLib = React.useRef({});
  var pageCanvasRef = React.useRef(document.createElement("canvas"));
  var linkService = React.useMemo(function () {
    return new pdf_viewer.PDFLinkService();
  }, []);
  var pageRendering = React.useRef(false);
  var renderPage = React.useCallback(function (num) {
    pageRendering.current = true;
    pdfDoc === null || pdfDoc === void 0 ? void 0 : pdfDoc.getPage(num).then(function (page) {
      var viewport = page.getViewport({
        scale: scaleRef.current
      });
      pageCanvasRef.current.height = viewport.height;
      pageCanvasRef.current.width = viewport.width;
      var ctx = pageCanvasRef.current.getContext("2d");
      var renderContext = {
        canvasContext: ctx,
        viewport: viewport,
        enableWebGL: true
      };
      var loadingTask = page.render(renderContext);
      loadingTask.promise.then(function () {
        return page.getAnnotations();
      }).then(function (annotationData) {
        var annotationDiv;

        if (enableAnnotations) {
          annotationDiv = document.createElement("div");
          annotationDiv.id = "annot" + num;
          annotationDiv.className = "annotationLayer";
          pdfjsLib.current.AnnotationLayer.render({
            viewport: viewport.clone({
              dontFlip: true
            }),
            div: annotationDiv,
            annotations: annotationData,
            page: page,
            linkService: linkService
          });
        }

        setPages(function (oldPages) {
          var _viewportRef$current;

          var newPages = [].concat(oldPages);

          var _ref4 = (_viewportRef$current = viewportRef.current) != null ? _viewportRef$current : {
            width: 100,
            height: 100
          },
              width = _ref4.width,
              height = _ref4.height;

          newPages[num] = React__default.createElement(PDFPage, {
            pageNum: num,
            width: width,
            height: height,
            imageSrc: pageCanvasRef.current.toDataURL("image/jpeg", quality / 100)
          }, enableAnnotations ? parse(annotationDiv.outerHTML) : null);
          return newPages;
        });
        pageRendering.current = false;
        page.cleanup();

        if (renderQueue.current.length > 0) {
          var no = renderQueue.current.shift();
          setTimeout(function () {
            return renderPage(no);
          }, 0);
        }
      }).catch(function (e) {
        console.error(e);
      });
    });
  }, [pdfDoc, linkService, quality, enableAnnotations]);
  var queueRenderPage = React.useCallback(function (num) {
    if (pageRendering.current) {
      if (!renderQueue.current.includes(num)) {
        renderQueue.current.push(num);
      }
    } else {
      renderPage(num);
    }
  }, [renderPage]);
  var changeZoom = React.useCallback(function (_ref5) {
    var _viewportRef$current$, _viewportRef$current2;

    var scale = _ref5.scale,
        viewer = _ref5.viewer,
        scrollContainer = _ref5.scrollContainer;
    var scroller = scrollContainer;
    renderQueue.current.length = 0;
    var children = viewer.children;
    scaleRef.current = scale;
    var oldHeight = (_viewportRef$current$ = (_viewportRef$current2 = viewportRef.current) === null || _viewportRef$current2 === void 0 ? void 0 : _viewportRef$current2.height) != null ? _viewportRef$current$ : 1;
    pdfDoc === null || pdfDoc === void 0 ? void 0 : pdfDoc.getPage(1).then(function (page) {
      viewportRef.current = page.getViewport({
        scale: scale
      });
      var _viewportRef$current3 = viewportRef.current,
          width = _viewportRef$current3.width,
          height = _viewportRef$current3.height;
      page.cleanup();
      var currPage = 1;

      for (var i = 0; i < children.length; i += 1) {
        if (children[i].offsetTop <= scroller.scrollTop + 33) {
          currPage = i + 1;
        }
      }

      setPages(function (oldPages) {
        var newPages = oldPages.map(function (pg, index) {
          if (!pg) {
            return React__default.createElement(React.Fragment, null);
          }

          var _pg$props = pg.props,
              imageSrc = _pg$props.imageSrc,
              PDFChildren = _pg$props.children;

          if (imageSrc) {
            return React__default.createElement(PDFPage, {
              pageNum: index,
              width: width,
              height: height,
              imageSrc: imageSrc
            }, PDFChildren);
          }

          return React__default.createElement(PlaceholderPage, {
            width: width,
            height: height,
            loadingImage: loadingImage
          });
        });
        return newPages;
      });
      queueRenderPage(currPage);

      if (currPage + 1 < pdfDoc.numPages) {
        queueRenderPage(currPage + 1);
      }

      for (var _i = 1; _i <= pdfDoc.numPages; _i += 1) {
        if (_i !== currPage && _i !== currPage + 1) {
          queueRenderPage(_i);
        }
      }

      var ratio = viewportRef.current.height / oldHeight;
      scroller.scrollTop *= ratio;
    });
  }, [pdfDoc, queueRenderPage, loadingImage]);
  React.useEffect(function () {
    if (pdfDoc) {
      pdfDoc.getPage(1).then(function (page) {
        viewportRef.current = page.getViewport({
          scale: scaleRef.current
        });
        page.cleanup();
        setPages(function (oldPages) {
          var _viewportRef$current4;

          var _ref6 = (_viewportRef$current4 = viewportRef.current) != null ? _viewportRef$current4 : {
            width: 100,
            height: 100
          },
              width = _ref6.width,
              height = _ref6.height;

          var numPages = pdfDoc.numPages;
          var newPages = [].concat(oldPages);

          for (var i = 1; i <= numPages; i += 1) {
            newPages[i] = React__default.createElement(PlaceholderPage, {
              width: width,
              height: height,
              loadingImage: loadingImage
            });
          }

          return newPages;
        });

        for (var i = 1; i <= pdfDoc.numPages; i += 1) {
          queueRenderPage(i);
        }
      });
    }
  }, [pdfDoc, queueRenderPage, loadingImage]);
  React.useEffect(function () {
    new Promise(function (resolve) { resolve(_interopNamespace(require('pdfjs-dist/es5/build/pdf'))); }).then(function (lib) {
      pdfjsLib.current = lib;
      new Promise(function (resolve) { resolve(_interopNamespace(require('pdfjs-dist/es5/build/pdf.worker.entry'))); }).then(function (pdfjsWorker) {
        var _pdfjsLib$current;

        pdfjsLib.current.GlobalWorkerOptions.workerSrc = pdfjsWorker;
        var loadingTask = (_pdfjsLib$current = pdfjsLib.current) === null || _pdfjsLib$current === void 0 ? void 0 : _pdfjsLib$current.getDocument({
          cMapUrl: CMAP_URL,
          cMapPacked: true,
          url: source,
          httpHeaders: source.httpHeaders
        });
        loadingTask.promise.then(function (pdfDocument) {
          setPdfDoc(pdfDocument);
        });
      });
    });
  }, [source]);
  React.useEffect(function () {
    return function () {
      pdfDoc === null || pdfDoc === void 0 ? void 0 : pdfDoc.cleanup();
      pdfDoc === null || pdfDoc === void 0 ? void 0 : pdfDoc.destroy();
    };
  }, []);
  return {
    changeZoom: changeZoom,
    pages: pages
  };
};
var PDFDocument = function PDFDocument(_ref7) {
  var source = _ref7.source,
      loadingImage = _ref7.loadingImage,
      quality = _ref7.quality,
      enableAnnotations = _ref7.enableAnnotations,
      _ref7$width = _ref7.width,
      width = _ref7$width === void 0 ? "600px" : _ref7$width,
      _ref7$height = _ref7.height,
      height = _ref7$height === void 0 ? "800px" : _ref7$height,
      className = _ref7.className;

  var _usePDF = usePDF({
    source: source,
    loadingImage: loadingImage,
    quality: quality,
    enableAnnotations: enableAnnotations
  }),
      pages = _usePDF.pages;
  return React__default.createElement("div", {
    style: {
      width: width,
      height: height
    },
    className: className
  }, pages);
};

exports.PDFDocument = PDFDocument;
exports.usePDF = usePDF;
//# sourceMappingURL=usePDF.js.map
