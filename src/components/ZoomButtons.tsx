import React, { useState } from "react";
import styles from "./styles/ZoomButtons.module.css";

const ZoomButtons = ({
	zoomChange, zoomStep = 0.1, zoomStart = 1, minZoom = 0.1, maxZoom = 3, className
}: IZoomButtons): JSX.Element => {
	const [zoom, setZoom] = useState(zoomStart ?? 1);

	const zoomIn = () => {
		const newZoom = zoom + zoomStep;
		if (newZoom < maxZoom) {
			setZoom(newZoom);
			zoomChange(newZoom);
		}
	};

	const zoomOut = () => {
		const newZoom = zoom - zoomStep;
		if (newZoom > minZoom) {
			setZoom(newZoom);
			zoomChange(newZoom);
		}
	};

	return (
		<div className={styles.buttonGroup}>
			<button type="button" id="btnZoomIn" className={[className, styles.zoomButton].join(" ")} onClick={() => zoomIn()}>+</button>
			<button type="button" id="btnZoomIn" className={[className, styles.zoomButton].join(" ")} onClick={() => zoomOut()}>-</button>
		</div>
	);
};

export default ZoomButtons;
