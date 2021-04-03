import React, { useRef, useState } from "react";
import styles from "./styles/ZoomButtons.module.css";

enum ZoomState {
	In = 1,
	None = 0,
	Out = -1
}

const ZoomButtons = ({
	zoomChangeStart,
	zoomChangeEnd,
	zoomStep = 0.3333, // zoom scale change per second
	zoomStart = 1,
	minZoom = 0.1,
	maxZoom = 5,
	className
}: IZoomButtons): JSX.Element => {
	const zoomRef = useRef<number>(zoomStart ?? 1);
	const [zoomDirection, setZoomDirection] = useState<ZoomState | null>(ZoomState.None);
	const [lastAnimationTime, setLastAnimationTime] = useState<number>(new Date().valueOf())
	const zoomEnd = () => {
		setZoomDirection(ZoomState.None);
		zoomChangeEnd();
	};

	const doZoom = (timestamp: number) => {
		if (zoomDirection === ZoomState.None) {
			return;
		}
		
		// make maxium 'jump' 100ms worth of zoom.
		const secsPassed = Math.min(0.1, (timestamp - (lastAnimationTime || timestamp)) / 1000);

		// 1/3 bigger/smaller every second
		const step = 1 + (zoomDirection! * secsPassed * zoomStep);

		const zoom = Math.max(minZoom, Math.min(maxZoom, zoomRef.current * step));
		setLastAnimationTime(timestamp);

		if (zoom !== zoomRef.current) {
			zoomRef.current = zoom;
			zoomChangeStart(zoomRef.current);
		}
	};

	const zoomInStart = () => {
		if (zoomDirection !== ZoomState.In) {
			setLastAnimationTime(0);
			setZoomDirection(ZoomState.In);
			window.requestAnimationFrame(doZoom);
		}
	};

	const zoomOutStart = () => {
		if (zoomDirection !== ZoomState.Out) {
			setLastAnimationTime(0);
			setZoomDirection(ZoomState.Out);
			window.requestAnimationFrame(doZoom);
		}
	};

	if (zoomDirection != 0) {
		window.requestAnimationFrame(doZoom);
	}

	return (
		<div className={styles.buttonGroup}>
			<button type="button" id="btnZoomIn" className={[className, styles.zoomButton].join(" ")} disabled={zoomRef.current >= maxZoom} onMouseDown={zoomInStart} onMouseUp={zoomEnd}>+</button>
			<button type="button" id="btnZoomOut" className={[className, styles.zoomButton].join(" ")} disabled={zoomRef.current <= minZoom} onMouseDown={zoomOutStart} onMouseUp={zoomEnd}>-</button>
		</div>
	);
};

export default ZoomButtons;
