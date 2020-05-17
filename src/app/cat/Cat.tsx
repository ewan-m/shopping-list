import * as React from "react";
import { useState, useEffect } from "react";

export const Cat = () => {
	const [catIndex, setCatIndex] = useState(Math.random());

	useEffect(() => {
		if (localStorage.getItem("wantsCats") === null) {
			localStorage.setItem("wantsCats", "true");
			setWantsToSeeCats(true);
		}
	});

	const [wantsToSeeCats, setWantsToSeeCats] = useState(
		localStorage.getItem("wantsCats") === "true"
	);
	const [wantsGifs, setWantsGifs] = useState(
		localStorage.getItem("wantsGifs") === "true"
	);

	return (
		<div
			key={`${wantsToSeeCats}`}
			className="fadeInBottomEntrance"
			style={{ marginTop: "3rem" }}
		>
			{wantsToSeeCats ? (
				<>
					<h2 className="boldText">A picture of a cat</h2>
					<img
						key={catIndex}
						className="fadeInBottomEntrance"
						src={`https://cataas.com/cat${
							wantsGifs ? "/gif" : ""
						}?catIndex=${catIndex}`}
						style={{ width: "100%", height: "auto", minHeight: "200px" }}
						alt="A picture of a cat"
					/>

					<button
						onClick={() => {
							setCatIndex(catIndex + 1);
						}}
						className="button button__secondary button--stacked"
					>
						I don't like the look of this cat
					</button>
					<button
						onClick={() => {
							setCatIndex(catIndex + 1);
							localStorage.setItem("wantsGifs", !wantsGifs ? "true" : "false");
							setWantsGifs(!wantsGifs);
						}}
						className="button button__secondary button--stacked"
					>
						I'd rather see cat {wantsGifs ? "pictures" : "gifs"} instead
					</button>
					<button
						onClick={() => {
							localStorage.setItem("wantsCats", "false");
							setWantsToSeeCats(false);
						}}
						className="button button__secondary button--stacked"
					>
						I don't want to see any cats
					</button>
				</>
			) : (
				<>
					<h2 className="boldText">You have opted out of seeing cats</h2>
					<button
						className="button button__primary button--large"
						onClick={() => {
							setWantsToSeeCats(true);
							localStorage.setItem("wantsCats", "true");
						}}
					>
						Opt back in to cats
					</button>
				</>
			)}
		</div>
	);
};
