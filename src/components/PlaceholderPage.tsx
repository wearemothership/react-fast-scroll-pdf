import styles from "./styles/PlaceholderPage.module.css";
import React from "react";
import Spinner from "../assets/spinner.gif";

const PlaceholderPage = ({ width, height, type = "place", loadingImage = Spinner, spin }: IPlaceholderPage): JSX.Element => {
	const classes = [
		spin ? styles.spinner : "",
		styles.centered
	]
	return (
		<div style={{ width: `${width}px`, height: `${height}px` }} data-type={type}>
			<img src={loadingImage} className={classes.join(" ")} alt="Loading..." />
		</div>
	);
};
export default PlaceholderPage;
