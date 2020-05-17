import moment from "moment";
import * as React from "react";
import { starterSuggestions } from "./starter-suggestions";
import "./List.scss";

interface ShoppingItem {
	name: string;
	orderedBy: "Ewan" | "Sofia";
	orderedOn: string;
}

enum State {
	unAuthorised = "unAuthorised",
	loading = "loading",
	loaded = "loaded",
	addingItem = "adding",
	sending = "sending",
}

export const List = () => {
	const [state, setState] = React.useState(State.unAuthorised);
	const [error, setError] = React.useState("");
	const [password, setPassword] = React.useState("");
	const [items, setItems] = React.useState([] as ShoppingItem[]);

	const [itemName, setItemName] = React.useState("");
	const [itemOrderedBy, setItemOrderedBy] = React.useState("Ewan");
	const [suggestions, setSuggestions] = React.useState(starterSuggestions);

	React.useEffect(() => {
		const pass = localStorage.getItem("password");
		if (pass) {
			setState(State.unAuthorised);
			setPassword(pass);
		}
	}, []);

	React.useEffect(() => {
		const rememberedSuggestions = localStorage.getItem("suggestions");
		if (rememberedSuggestions) {
			setSuggestions([
				...JSON.parse(rememberedSuggestions),
				...starterSuggestions,
			]);
		}
	}, []);

	React.useEffect(() => {
		if (localStorage.getItem("password") && password) {
			getData();
		}
	}, [password]);

	const getData = async () => {
		setError("");
		try {
			setState(State.loading);
			const result = await (
				await fetch("https://api.jsonbin.io/b/5eb6b361a47fdd6af16043d4", {
					headers: {
						"secret-key": password,
					},
				})
			).json();

			if (!result.data) {
				throw Error();
			}
			setItems(result.data as ShoppingItem[]);
			setState(State.loaded);
			localStorage.setItem("password", password);
		} catch (error) {
			setError(error?.message);
			setState(State.unAuthorised);
		}
	};

	const putData = async (items: ShoppingItem[], stateOnError: State) => {
		try {
			const result = await (
				await fetch("https://api.jsonbin.io/b/5eb6b361a47fdd6af16043d4", {
					body: JSON.stringify({
						data: items,
					}),
					method: "PUT",
					headers: {
						"content-type": "application/json",
						"secret-key": password,
						"versioning": "false",
					},
				})
			).json();
			if (result?.data?.data) {
				setItems(result.data.data);
			}
			setState(State.loaded);
			setItemName("");
		} catch (error) {
			setState(stateOnError);
			setError(error?.message);
		}
	};

	const addItem = async () => {
		if (!itemName) {
			return;
		}
		setState(State.addingItem);

		const rememberedSuggestions = localStorage.getItem("suggestions");
		if (rememberedSuggestions) {
			localStorage.setItem(
				"suggestions",
				JSON.stringify([itemName, ...JSON.parse(rememberedSuggestions)])
			);
		} else {
			localStorage.setItem("suggestions", JSON.stringify([itemName]));
		}
		setSuggestions([itemName, ...suggestions]);

		putData(
			[
				{
					name: itemName,
					orderedBy: itemOrderedBy,
					orderedOn: new Date().toISOString(),
				} as ShoppingItem,
				...items,
			],
			State.addingItem
		);
	};

	const removeItem = async (item: ShoppingItem) => {
		setState(State.sending);
		putData(
			items.filter((item2) => item2.name !== item.name),
			State.loaded
		);
	};

	switch (state) {
		case State.unAuthorised:
			return (
				<form className="form fadeInBottomEntrance">
					<label className="form__label">
						Password{" "}
						<input
							className="form__input"
							value={password}
							onChange={(e) => {
								setPassword(e.target.value);
							}}
							type="text"
						/>
					</label>
					<button
						className="button button__primary button--large"
						onClick={(e) => {
							e.preventDefault();
							getData();
						}}
					>
						Enter
					</button>
					{error && <p>{error}</p>}
				</form>
			);

		case State.loading:
		case State.sending:
			return <></>;

		case State.loaded:
			return (
				<div className="fadeInBottomEntrance">
					{items.map((item) => (
						<div className="shoppingItem">
							<div>
								<h2 className="shoppingItem__header boldText">{item.name}</h2>
								<p className="shoppingItem__info">
									{item.orderedBy}{" "}
									<span style={{ fontSize: "0.75rem" }}>
										{" "}
										- {moment(item.orderedOn).fromNow()}
									</span>
								</p>
							</div>
							<button
								className="button button__secondary"
								aria-label="remove item"
								onClick={(e) => {
									e.preventDefault();

									(async () => await getData())().then(() => {
										removeItem(item);
									});
								}}
							>
								X
							</button>
						</div>
					))}
					<button
						className="button button__primary button--large"
						onClick={() => {
							(async () => await getData())().then(() => {
								setState(State.addingItem);
							});
						}}
					>
						Add an item
					</button>
				</div>
			);
		case State.addingItem:
			return (
				<form className="form fadeInBottomEntrance">
					<label className="form__label boldText">
						Add a shopping item
						<input
							className="form__input"
							type="text"
							value={itemName}
							onChange={(e) => {
								e.preventDefault();
								setItemName(e.target.value);
							}}
						/>
						<div>
							{suggestions
								.filter(
									(sugg) =>
										sugg.toLowerCase().includes(itemName.toLowerCase()) &&
										sugg.toLowerCase() !== itemName.toLowerCase()
								)
								.slice(0, 5)
								.map((suggestion) => (
									<button
										key={suggestion}
										className="button button__secondary"
										onClick={() => {
											setItemName(suggestion);
										}}
										style={{ marginRight: "0.375rem" }}
									>
										{suggestion}
									</button>
								))}
						</div>
						<select
							className="form__input"
							value={itemOrderedBy}
							onChange={(e) => {
								setItemOrderedBy(e.target.value);
							}}
						>
							{["Ewan", "Sofia"].map((value) => (
								<option value={value}>{value}</option>
							))}
						</select>
					</label>
					<div>
						<button
							className="button button__secondary button--large"
							onClick={(e) => {
								e.preventDefault();
								setState(State.loaded);
							}}
							style={{ margin: "0 0.375rem 0.375rem 0" }}
						>
							Cancel
						</button>
						<button
							type="submit"
							className="button button__primary button--large"
							onClick={(e) => {
								e.preventDefault();
								addItem();
							}}
						>
							Add item
						</button>
					</div>
				</form>
			);

		default:
			return <p>Woops this should never happen</p>;
	}
};
