import * as React from "react";
import { render } from "react-dom";
import moment from "moment";
import "./index.scss";

const binUrl = "https://extendsclass.com/api/json-storage/bin/eecafeb";

interface ShoppingItem {
	orderedBy: "Ewan" | "Sofia";
	orderedOn: string;
	obtained: boolean;
}

interface ShoppingList {
	[itemName: string]: ShoppingItem;
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
	const [items, setItems] = React.useState({} as ShoppingList);

	const [itemName, setItemName] = React.useState("");
	const [itemOrderedBy, setItemOrderedBy] = React.useState(
		"Ewan" as "Ewan" | "Sofia"
	);

	React.useEffect(() => {
		const pass = localStorage.getItem("password");
		if (pass) {
			setState(State.loading);
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
		setState(State.loading);
		const response = (
			await fetch(binUrl, {
				headers: {
					"security-key": password,
				},
			})
		).json();
		const result = await response;
		if (result?.status === 1) {
			setError(result.message);
			if (result.message.toString().includes("Wrong Security key")) {
				setState(State.unAuthorised);
				localStorage.removeItem("password");
			} else {
				setState(State.loaded);
			}
		} else {
			if (result && Object.keys(result)?.length > 0) {
				setItems(result);
			}
			setState(State.loaded);
			localStorage.setItem("password", password);
		}
	};

	const updateItem = async (itemName: string, item: ShoppingItem) => {
		setError("");
		setState(State.sending);
		const response = (
			await fetch(binUrl, {
				headers: {
					"security-key": password,
					"content-type": "application/merge-patch+json",
				},
				body: JSON.stringify({ [itemName]: item }),
				method: "PATCH",
			})
		).json();
		const result = await response;
		if (result.status === 1) {
			setError(result?.message);
			if (result?.message.toString().includes("Wrong Security key")) {
				setState(State.unAuthorised);
				localStorage.removeItem("password");
			} else {
				setState(State.loaded);
			}
		} else {
			if (result.data) {
				setItems(JSON.parse(result.data));
			}
			setState(State.loaded);
			localStorage.setItem("password", password);
		}
	};

	const addItem = async () => {
		if (!itemName) {
			return;
		}
		await updateItem(itemName, {
			orderedOn: new Date().toISOString(),
			obtained: false,
			orderedBy: itemOrderedBy,
		});
	};

	const removeItem = async (key: string) => {
		if (key in items) {
			await updateItem(key, { ...items[key], ...{ obtained: true } });
		}
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
					{Object.keys(items).map((key) => {
						return !items[key].obtained ? (
							<div className="shoppingItem" key={key}>
								<h2 className="shoppingItem__header">{key}</h2>
								<div className="shoppingItem__row">
									<p className="shoppingItem__info">
										{items[key].orderedBy}{" "}
										<span style={{ fontSize: "0.75rem" }}>
											{" "}
											- {moment(items[key].orderedOn).fromNow()}
										</span>
									</p>

									<button
										className="button button__secondary"
										onClick={(e) => {
											e.preventDefault();
											removeItem(key);
										}}
									>
										Remove item
									</button>
								</div>
							</div>
						) : (
							<></>
						);
					})}
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
								setItemOrderedBy(e.target.value as "Ewan" | "Sofia");
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
			return <p className="fadeInBottomEntrance">Modifying that item!</p>;
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
