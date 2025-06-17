require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const Person = require("./models/person");

const PORT = process.env.PORT;

const app = express();

app.use(express.static("build"));
app.use(express.json());
app.use(cors());

app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send("Oops");
});

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
	let personsCount = 0;
	Person.find({}).then((result) => {
		personsCount = result.length;
		const currDateTime = Date.now();
		res.send(`<div>
            <p>Phonebook has info for ${personsCount} people</p>
            <p>${new Date(currDateTime)}</p>
        </div>`);
	});
});

app.get("/api/persons/:id", (req, res, next) => {
	Person.findById(req.params.id)
		.then((person) => {
			if (person) {
				res.json(person);
			} else {
				res.status(404).end();
			}
		})
		.catch((error) => next(error));
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

app.put("/api/persons/:id", (req, res, next) => {
	const { name, number } = req.body;

	Person.findById(req.params.id)
		.then((person) => {
			if (!person) {
				res.status(404).end();
			}
			person.name = name;
			person.number = number;

			return person.save().then((updatedPerson) => {
				res.json(updatedPerson);
			});
		})
		.catch((err) => next(err));
});

app.delete("/api/persons/:id", (req, res, next) => {
	const id = req.params.id;
	Person.findByIdAndDelete(id)
		.then((result) => {
			res.status(204).end();
		})
		.catch((err) => next(err));
});

const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (err, req, res, next) => {
	console.error(err.message);

	if (err.name === "CastError") {
		return res.status(400).send({ error: "malformatted id" });
	}

	next(error);
};

app.use(errorHandler);

app.listen(PORT, () => {
	console.log(`Server is running at port ${PORT}`);
});
