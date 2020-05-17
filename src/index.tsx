import * as React from "react";
import { render } from "react-dom";
import { Cat } from "./app/cat/Cat";
import { List } from "./app/list/List";
import "./index.scss";

const Index = () => {
	return (
		<div className="outerWindow">
			<div className="innerWindow">
				<header className="siteHeader">
					<h1 className="boldText siteHeader__h1">Shopping list</h1>
				</header>
				<main className="siteMain">
					<List />
					<Cat />
				</main>
				<footer className="siteFooter">Made with ❤️ by Ewan.</footer>
			</div>
		</div>
	);
};

render(<Index />, document.getElementById("root"));
