import React, { useRef } from "react";
import styles from "./styles/ZoomButtons.module.css";

const ZoomButtons = ({
	zoomChangeStart,
	zoomChangeEnd,
	zoomStep = 0.005,
	zoomStart = 1,
	minZoom = 0.1,
	maxZoom = 5,
	className
}: IZoomButtons): JSX.Element => {
	const zoomInterval = useRef<NodeJS.Timeout>();
	const aniFrameRef = useRef<number>();
	const zoomRef = useRef<number>(zoomStart ?? 1);

	const zoomEnd = () => {
		if (zoomInterval.current) {
			zoomChangeEnd();
			if (aniFrameRef.current) {
				window.cancelAnimationFrame(aniFrameRef.current);
				aniFrameRef.current = undefined;
			}
			clearInterval(zoomInterval.current);
			zoomInterval.current = undefined;
		}
	};

	const zoomInStart = () => {
		if (!zoomInterval.current) {
			zoomInterval.current = setInterval(() => {
				if (aniFrameRef.current) {
					window.cancelAnimationFrame(aniFrameRef.current);
					aniFrameRef.current = undefined;
				}
				aniFrameRef.current = window.requestAnimationFrame(() => {
					const step = ((zoomRef.current / maxZoom) * zoomStep) * 10;
					zoomRef.current = Math.round((zoomRef.current + step) * 10000) / 10000;
					if (zoomRef.current <= maxZoom) {
						zoomChangeStart(zoomRef.current);
					}
					else {
						zoomEnd();
					}
				});
			}, 25);
		}
	};

	const zoomOutStart = () => {
		if (!zoomInterval.current) {
			zoomInterval.current = setInterval(() => {
				if (aniFrameRef.current) {
					window.cancelAnimationFrame(aniFrameRef.current);
					aniFrameRef.current = undefined;
				}
				window.requestAnimationFrame(() => {
					const step = ((zoomRef.current / maxZoom) * zoomStep) * 10;
					zoomRef.current = Math.round((zoomRef.current - step) * 10000) / 10000;
					if (zoomRef.current >= minZoom) {
						zoomChangeStart(zoomRef.current);
					}
					else {
						zoomEnd();
					}
				});
			}, 25);
		}
	};

	return (
		<div className={styles.buttonGroup}>
			<button type="button" id="btnZoomIn" className={[className, styles.zoomButton].join(" ")} disabled={zoomRef.current >= maxZoom} onMouseDown={zoomInStart} onMouseUp={zoomEnd}>+</button>
			<button type="button" id="btnZoomOut" className={[className, styles.zoomButton].join(" ")} disabled={zoomRef.current <= minZoom} onMouseDown={zoomOutStart} onMouseUp={zoomEnd}>-</button>
		</div>
	);
};

export default ZoomButtons;
