import React, { useEffect, useRef } from "react";
import styles from "./styles/ZoomButtons.module.css";

enum ZoomDirection {
	In = 1,
	None = 0,
	Out = -1
}

interface IZoomState {
	pos: number
	direction: ZoomDirection
	animReq?: number,
	lastTimestamp: number
}

const ZoomButtons = ({
	zoomChangeStart,
	zoomChangeEnd,
	zoomStep = 1, // change per second
	zoomStart = 1,
	minZoom = 0.1,
	maxZoom = 5,
	className
}: IZoomButtons): JSX.Element => {
	const zoomStateRef = useRef<IZoomState>({
		pos: zoomStart || 1,
		direction: ZoomDirection.None,
		lastTimestamp: 0
	} ?? 1);

	const doZoom = (timestamp: number) => {
		const { pos, direction, lastTimestamp } = zoomStateRef.current;
		if (direction === ZoomDirection.None) {
			return;
		}
		const diff = Math.max(0, timestamp - lastTimestamp) || 20; // 1st move 20 ms step
		// make maxium 'jump' 50ms worth of zoom.
		const secsPassed = Math.min(50, diff) / 1000;
		// zoom in/out step every second
		const step = 1 + (direction * secsPassed * zoomStep);

		const zoom = Math.max(minZoom, Math.min(maxZoom, pos * step));

		zoomStateRef.current = {
			pos: zoom,
			direction,
			lastTimestamp: timestamp,
			animReq: window.requestAnimationFrame(doZoom)
		};

		if (zoom !== pos) {
			zoomChangeStart(zoom);
		}
	};

	const setZoomDirection = (newDirection: ZoomDirection) => {
		const { direction, animReq, lastTimestamp } = zoomStateRef.current;
		if (newDirection === direction) {
			return;
		}
		const currentlyAnimating = direction !== ZoomDirection.None;
		if (newDirection === ZoomDirection.None) {
			let timeout = 20; // 20 ms - magic number!
			if (animReq && lastTimestamp !== 0) {
				// Stop immediately, we have already animated a couple of frames +
				window.cancelAnimationFrame(animReq);
				delete zoomStateRef.current.animReq;
				timeout = 0;
			}
			setTimeout(() => {
				zoomStateRef.current = { ...zoomStateRef.current, direction: ZoomDirection.None };
				zoomChangeEnd();
			}, timeout); // otherwise let it carry on a bit for short taps
			return;
		}
		zoomStateRef.current = {
			...zoomStateRef.current,
			direction: newDirection
		};
		if (!currentlyAnimating) {
			zoomStateRef.current.lastTimestamp = 0;
			doZoom(0);
		}
	};

	const zoomInStart = () => setZoomDirection(ZoomDirection.In);

	const zoomOutStart = () => setZoomDirection(ZoomDirection.Out);

	const zoomEnd = () => setZoomDirection(ZoomDirection.None);

	useEffect(() => {
		zoomStateRef.current = { ...zoomStateRef.current, pos: zoomStart };
	}, [zoomStart]);

	const zoomPos = zoomStateRef.current.pos;
	const style = `${className} ${styles.zoomButton}`;

	return (
		<div className={styles.buttonGroup}>
			<button type="button" id="btnZoomIn" className={style} disabled={zoomPos >= maxZoom} onMouseDown={zoomInStart} onMouseLeave={zoomEnd} onMouseUp={zoomEnd}>+</button>
			<button type="button" id="btnZoomOut" className={style} disabled={zoomPos <= minZoom} onMouseDown={zoomOutStart} onMouseLeave={zoomEnd} onMouseUp={zoomEnd}>-</button>
		</div>
	);
};

export default ZoomButtons;
