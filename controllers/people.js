const peopleRouter = require('express').Router();
const Person = require('../models/person');

peopleRouter.get('/', async (req, res) => {
	const people = await Person.find({});
	res.json(people);
});

// peopleRouter.get('/info', (req, res) => {
// 	let personsCount = 0;
// 	Person.find({}).then((result) => {
// 		personsCount = result.length;
// 		const currDateTime = Date.now();
// 		res.send(`<div>
//             <p>Phonebook has info for ${personsCount} people</p>
//             <p>${new Date(currDateTime)}</p>
//         </div>`);
// 	});
// });

peopleRouter.get('/:id', async (req, res, next) => {
	try {
		const person = await Person.findById(req.params.id);
		if (person) {
			res.json(person);
		} else {
			res.status(404).end();
		}
	} catch (error) {
		next(error);
	}
});

peopleRouter.post('/', async (req, res, next) => {
	const body = req.body;
	if (!body.name || !body.number) {
		return res.status(400).json({
			error: 'name or number is missing',
		});
	}

	const person = new Person({
		name: body.name,
		number: body.number,
	});

	try {
		const savedPerson = await person.save();
		res.status(201).json(savedPerson);
	} catch (error) {
		next(error);
	}
});

peopleRouter.put('/:id', async (req, res, next) => {
	const { name, number } = req.body;

	try {
		const person = await Person.findById(req.params.id);
		if (!person) {
			res.status(404).end();
		}
		person.name = name;
		person.number = number;

		const updatedPerson = await person.save();
		res.json(updatedPerson);
	} catch (error) {
		next(error);
	}
});

peopleRouter.delete('/:id', async (req, res, next) => {
	const id = req.params.id;

	try {
		await Person.findByIdAndDelete(id);
		res.status(204).end();
	} catch (error) {
		next(error);
	}
});

module.exports = peopleRouter;
