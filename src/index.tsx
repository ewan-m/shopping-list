import * as React from "react";
import { render } from "react-dom";
import moment from "moment";
import "./index.scss";

// const mock = {
// 	data: [
// 		{
// 			name: "Do we really need milk? ",
// 			orderedBy: "Ewan",
// 			orderedOn: "2020-05-09T15:17:02.572Z",
// 		},
// 		{ name: "Milk", orderedBy: "Sofia", orderedOn: "2020-05-09T15:16:29.970Z" },
// 		{
// 			name: "Cherries",
// 			orderedBy: "Ewan",
// 			orderedOn: "2020-05-09T14:42:31.002Z",
// 		},
// 	],
// };

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

const App = () => {
	const [state, setState] = React.useState(State.unAuthorised);
	const [error, setError] = React.useState("");
	const [password, setPassword] = React.useState("");
	const [items, setItems] = React.useState([] as ShoppingItem[]);

	const [itemName, setItemName] = React.useState("");
	const [itemOrderedBy, setItemOrderedBy] = React.useState("Ewan");

	React.useEffect(() => {
		const pass = localStorage.getItem("password");
		if (pass) {
			setState(State.unAuthorised);
			setPassword(pass);
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
			const response = (
				await fetch("https://api.jsonbin.io/b/5eb6b361a47fdd6af16043d4", {
					headers: {
						"secret-key": password,
					},
				})
			).json();
			const result = await response;

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
			await getData();
			const result = await fetch(
				"https://api.jsonbin.io/b/5eb6b361a47fdd6af16043d4",
				{
					body: JSON.stringify({
						data: items,
					}),
					method: "PUT",
					headers: {
						"content-type": "application/json",
						"secret-key": password,
						"versioning": "false",
					},
				}
			);
			await getData();
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
		setState(State.loading);
		putData(
			items.filter((item2) => item2.name !== item.name),
			State.loaded
		);
	};

	switch (state) {
		case State.unAuthorised:
			return (
				<form className="form fadeInBottomEntrance">
					<label>
						Password{" "}
						<input
							className="formInput"
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
			return <p className="fadeInBottomEntrance">Loading the shopping list!</p>;

		case State.loaded:
			return (
				<div className="fadeInBottomEntrance">
					{items.map((item) => (
						<div className="shoppingItem">
							<h2 className="shoppingItem__header">{item.name}</h2>
							<div className="shoppingItem__row">
								<p className="shoppingItem__info">
									{item.orderedBy}{" "}
									<span style={{ fontSize: "0.75rem" }}>
										{" "}
										- {moment(item.orderedOn).fromNow()}
									</span>
								</p>

								<button
									className="button button__secondary"
									onClick={(e) => {
										e.preventDefault();
										removeItem(item);
									}}
								>
									Remove item
								</button>
							</div>
						</div>
					))}
					<button
						className="button button__primary button--large"
						onClick={() => {
							setState(State.addingItem);
						}}
					>
						Add an item
					</button>
				</div>
			);
		case State.addingItem:
			return (
				<form className="form fadeInBottomEntrance">
					<label>
						Add a shopping item
						<input
							className="formInput"
							type="text"
							value={itemName}
							onChange={(e) => {
								e.preventDefault();
								setItemName(e.target.value);
							}}
						/>
						<select
							className="formInput"
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

		case State.sending:
			return <p className="fadeInBottomEntrance">Adding your item!</p>;
		default:
			return (
				<p className="fadeInBottomEntrance">Woops this should never happen</p>
			);
	}
};

const Index = () => {
	return (
		<div className="funkyOuter">
			<div className="funkyInner">
				<header className="siteHeader">
					<h1 className="siteHeader__h1">Shopping list</h1>
				</header>
				<main className="siteMain">
					<App />
				</main>
			</div>
		</div>
	);
};

render(<Index />, document.getElementById("root"));
