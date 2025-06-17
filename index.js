require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const Person = require("./models/person");

const PORT = process.env.PORT;

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

app.get("/api/persons", (req, res) => {
	Person.find({}).then((persons) => {
		res.json(persons);
	});
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
	Person.findById(req.params.id).then((person) => {
		res.json(person);
	});
});

app.post("/api/persons", (req, res) => {
	const body = req.body;
	if (!body.name || !body.number) {
		return res.status(400).json({
			error: "name or number is missing",
		});
	}

	const person = new Person({
		name: body.name,
		number: body.number,
	});

	person.save().then((savedPerson) => {
		res.json(savedPerson);
	});
});

app.delete("/api/persons/:id", (req, res) => {
	const id = req.params.id;
	Person.deleteOne({ _id: id }).then(() => {
		res.status(204).end();
	});
});

app.listen(PORT, () => {
	console.log(`Server is running at port ${PORT}`);
});
