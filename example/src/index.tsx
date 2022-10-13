import React from "react";
// eslint-disable-next-line import/extensions
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

const container = document.getElementById("root");
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);
root.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);
