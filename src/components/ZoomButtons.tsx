import React, { useEffect, useRef } from "react";
import styles from "./styles/ZoomButtons.module.css";
import { IZoomButtons } from "../types/fastScrollPDF";

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

interface IZoomButton {
	style: string
	disabled: boolean
	start: () => void
	end: () => void
	children: JSX.Element
}

const ZoomButton = ({
	style,
	disabled,
	start,
	end,
	children
}:IZoomButton): JSX.Element => (
	<button
		type="button"
		className={style}
		disabled={disabled}
		onTouchStart={start}
		onTouchCancel={end}
		onTouchEnd={end}
		onMouseDown={start}
		onMouseLeave={end}
		onMouseUp={end}
	>
		{ children }
	</button>
);

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
			lastTimestamp: timestamp
		};

		if (zoom !== pos) {
			if (timestamp === 0) {
				setTimeout(() => {
					const { direction: dir } = zoomStateRef.current;
					if (dir !== ZoomDirection.None) {
						zoomStateRef.current.animReq = window.requestAnimationFrame(doZoom);
					}
				}, 150);
			}
			else {
				zoomStateRef.current.animReq = window.requestAnimationFrame(doZoom);
			}
			zoomChangeStart(zoom);
		}
		else {
			zoomStateRef.current.direction = ZoomDirection.None;
			zoomChangeEnd();
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
			<ZoomButton
				style={style}
				disabled={zoomPos >= maxZoom}
				start={zoomInStart}
				end={zoomEnd}
			>
				<b>+</b>
			</ZoomButton>
			<ZoomButton
				style={style}
				disabled={zoomPos <= minZoom}
				start={zoomOutStart}
				end={zoomEnd}
			>
				<b>-</b>
			</ZoomButton>
		</div>
	);
};

export default ZoomButtons;
