const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const PORT = process.env.port || 3001;

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("build"));

morgan.token("body", function (req, res) {
	return JSON.stringify(req.body);
});

app.use(
	morgan((tokens, req, res) => {
		return [
			tokens.method(req, res),
			tokens.url(req, res),
			tokens.status(req, res),
			tokens.body(req, res),
			tokens.res(req, res, "content-length"),
			"-",
			tokens["response-time"](req, res),
			"ms",
		].join(" ");
	})
);

let persons = [
	{
		id: 1,
		name: "Arto Hellas",
		number: "040-123456",
	},
	{
		id: 2,
		name: "Ada Lovelace",
		number: "39-44-5323523",
	},
	{
		id: 3,
		name: "Dan Abramov",
		number: "12-43-234345",
	},
	{
		id: 4,
		name: "Mary Poppendieck",
		number: "39-23-6423122",
	},
];

function generateId(arr) {
	const ids = arr.map((item) => item.id).sort((a, b) => a - b);
	return ids[ids.length - 1] + 1;
}

app.get("/api/persons", (req, res) => {
	res.json(persons);
});

app.get("/info", (req, res) => {
	const personsCount = persons.length;
	const currDateTime = Date.now();

	res.send(`<div>
            <p>Phonebook has info for ${personsCount} people</p>
            <p>${new Date(currDateTime)}</p>
        </div>`);
});

app.get("/api/persons/:id", (req, res) => {
	const id = req.params.id;

	const person = persons.find((p) => p.id === id);

	if (person) {
		res.json(person);
	} else {
		res.status(404).end();
	}
});

app.post("/api/persons", (req, res) => {
	const pers = req.body;

	if (!pers.name || !pers.number) {
		return res.status(400).json({
			error: "name or number is missing",
		});
	}

	if (persons.map((p) => p.name).includes(pers.name)) {
		return res.status(400).json({
			error: `entry with name ${pers.name} already exists`,
		});
	}

	const newId = generateId(persons);
	const newPers = {
		id: newId,
		name: pers.name,
		number: pers.number,
	};

	persons = persons.concat(newPers);

	res.json(newPers);
});

app.delete("/api/persons/:id", (req, res) => {
	const id = req.params.id;

	persons = persons.filter((p) => p.id !== Number(id));
	console.log("persons", persons);

	res.status(204).end();
});

app.listen(PORT, () => {
	console.log(`Server is running at port ${PORT}`);
});
