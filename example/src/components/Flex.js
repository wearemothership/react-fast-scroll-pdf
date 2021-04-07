import React from "react";

const Flex = ({
	className = null,
	children,
	justifyContent = "flex-start",
	flexDirection = "column",
	flexGrow = 0,
	flexBasis = "auto",
	flexShrink = 1,
	flexWrap = "nowrap",
	flex = "0 1 auto",
	alignItems = "stretch",
	margin = "0",
	padding = "0",
	width = "auto",
	height = "auto",
	maxWidth = "100%",
	backgroundColor = null
}) => (
	<div
		className={className}
		style={{
			display: "flex",
			justifyContent,
			flexDirection,
			flexGrow,
			flexBasis,
			flexShrink,
			flexWrap,
			flex,
			alignItems,
			margin,
			padding,
			width,
			height,
			maxWidth,
			backgroundColor
		}}
	>
		{ children }
	</div>
);

export default Flex;
