import {
	ReactNode, useCallback, useEffect, useRef, FC
} from "react";
import styles from "./styles/ZoomButtons.module.css";
import type { IZoomButtons } from "../types/fastScrollPDF";

enum ZoomDirection {
	In = 1,
	None = 0,
	Out = -1
}

interface IZoomState {
	pos: number
	direction: ZoomDirection
	animReq?: number,
	lastTimestamp: number,
	fitPage: boolean
}

interface IZoomButton {
	className: string
	disabled: boolean
	start: () => void
	end: () => void
	children: ReactNode
}

const ZoomButton: FC<IZoomButton> = ({
	className,
	disabled,
	start,
	end,
	children
}: IZoomButton) => (
	<button
		type="button"
		className={className}
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

const ZoomButtons: FC<IZoomButtons> = ({
	zoomChangeStart,
	zoomChangeEnd,
	zoomFit,
	zoomStep = 1, // change per second
	zoomStart = 1,
	minZoom = 0.1,
	maxZoom = 5,
	buttonClasses,
	groupClasses,
	selectedClass,
	icons = {
		zoomIn: <b>+</b>,
		zoomOut: <b>-</b>,
		fitPage: <b>Fit</b>
	}
}: IZoomButtons) => {
	const zoomStateRef = useRef<IZoomState>({
		pos: zoomStart || 1,
		direction: ZoomDirection.None,
		lastTimestamp: 0,
		fitPage: false
	});

	const doZoom = useCallback((timestamp: number) => {
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
			fitPage: false
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
	}, [maxZoom, minZoom, zoomChangeEnd, zoomChangeStart, zoomStep]);

	const setZoomDirection = useCallback((newDirection: ZoomDirection) => {
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
	}, [doZoom, zoomChangeEnd]);

	const zoomInStart = useCallback(() => setZoomDirection(ZoomDirection.In), [setZoomDirection]);

	const zoomOutStart = useCallback(() => setZoomDirection(ZoomDirection.Out), [setZoomDirection]);

	const zoomEnd = useCallback(() => setZoomDirection(ZoomDirection.None), [setZoomDirection]);

	const fitPage = useCallback(() => {
		if (zoomFit) {
			const newZoom = zoomFit();
			if (newZoom) {
				zoomStateRef.current = {
					pos: newZoom,
					direction: ZoomDirection.None,
					lastTimestamp: 0,
					fitPage: true
				};
			}
		}
	}, [zoomFit]);

	useEffect(() => {
		zoomStateRef.current = { ...zoomStateRef.current, pos: zoomStart };
	}, [zoomStart]);

	const zoomPos = zoomStateRef.current.pos;

	return (
		<div className={groupClasses ?? styles.buttonGroup}>
			<ZoomButton
				className={buttonClasses ?? styles.zoomButton}
				disabled={zoomPos <= minZoom}
				start={zoomOutStart}
				end={zoomEnd}
			>
				{ icons.zoomOut }
			</ZoomButton>
			<ZoomButton
				className={buttonClasses ?? styles.zoomButton}
				disabled={zoomPos >= maxZoom}
				start={zoomInStart}
				end={zoomEnd}
			>
				{ icons.zoomIn }
			</ZoomButton>
			{ zoomFit
				? (
					<button
						className={[
							buttonClasses ?? styles.zoomButton,
							zoomStateRef.current.fitPage ? selectedClass : undefined
						].filter((b) => !!b).join(" ")}
						onClick={fitPage}
						type="button"
					>
						{ icons.fitPage }
					</button>
				)
				: null }
		</div>
	);
};

export default ZoomButtons;
