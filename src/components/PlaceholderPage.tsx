import Spinner from "../assets/spinner.gif";
import styles from "./styles/PlaceholderPage.module.css";
import type { IPlaceholderPage } from "../types/fastScrollPDF";
import {
	FC
} from "react";

const PlaceholderPage: FC<IPlaceholderPage> = ({
	width, height, type = "place", loadingImage = Spinner, spin
}) => {
	const classes = [
		spin ? styles.spinner : "",
		styles.centered
	];
	return (
		<div style={{ width: `${width}px`, height: `${height}px` }} data-type={type}>
			<img src={loadingImage} className={classes.join(" ")} alt="Loading..." />
		</div>
	);
};
export default PlaceholderPage;
