import React, { useState } from "react";
import styles from "./styles/ZoomButtons.module.css";

const ZoomButtons = ({
	zoomChange, zoomStep = 0.1, zoomStart = 1, minZoom = 0.1, maxZoom = 3, className
}: IZoomButtons): JSX.Element => {
	const [zoom, setZoom] = useState(zoomStart ?? 1);

	const zoomIn = () => {
		const newZoom = Math.round((zoom + zoomStep) * 100) / 100;
		if (newZoom <= maxZoom) {
			setZoom(newZoom);
			zoomChange(newZoom);
		}
	};

	const zoomOut = () => {
		const newZoom = Math.round((zoom - zoomStep) * 100) / 100;
		if (newZoom >= minZoom) {
			setZoom(newZoom);
			zoomChange(newZoom);
		}
	};

	return (
		<div className={styles.buttonGroup}>
			<button type="button" id="btnZoomIn" className={[className, styles.zoomButton].join(" ")} disabled={zoom >= maxZoom} onClick={() => zoomIn()}>+</button>
			<button type="button" id="btnZoomOut" className={[className, styles.zoomButton].join(" ")} disabled={zoom <= minZoom} onClick={() => zoomOut()}>-</button>
		</div>
	);
};

export default ZoomButtons;
